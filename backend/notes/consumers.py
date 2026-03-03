import json
from urllib.parse import parse_qs
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Note, Collaboration
from asgiref.sync import sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken

class NoteConsumer(AsyncWebsocketConsumer):
    active_users = {}

    async def connect(self):
        try:
            print("WS connect start")

            self.note_id = self.scope['url_route']['kwargs']['note_id']
            self.group_name = f'note_{self.note_id}'

            self.user = await self.get_user_from_token()
            print("User:", self.user)

            if not self.user:
                print("No user")
                await self.close()
                return

            has_access = await self.user_has_access()
            print("Has access:", has_access)

            if not has_access:
                print("Access denied")
                await self.close()
                return

            self.role = await self.get_user_role()
            print("Role:", self.role)

            if not self.role:
                print("No role")
                await self.close()
                return

            note = await self.get_note()
            print("Note:", note)

            print("Adding to group...")
            await self.channel_layer.group_add(self.group_name, self.channel_name)

            print("Accepting connection")
            await self.accept()

            if self.note_id not in NoteConsumer.active_users:
                NoteConsumer.active_users[self.note_id] = set()

            NoteConsumer.active_users[self.note_id].add(self.user.username)

            await self.send(text_data=json.dumps({
                "type": "active_users",
                "users": list(NoteConsumer.active_users[self.note_id])
            }))

            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "user_joined",
                    "username": self.user.username
                }
            )

        except Exception as e:
            print("WS ERROR:", e)
            await self.close()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

        if hasattr(self, "user") and self.user is not None:
            if self.note_id in NoteConsumer.active_users:
                NoteConsumer.active_users[self.note_id].discard(self.user.username)

            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "user_left",
                    "username": self.user.username
                }
            )

    async def receive(self, text_data):
        if self.role == "viewer":
            return
        
        data = json.loads(text_data)
        content = data.get("content", "")
        
        if content is None:
            return

        await self.update_note(content)
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'note_update',
                'content': content
            }
        )

    async def note_update(self, event):
        await self.send(text_data=json.dumps({
            "type": "note_update",
            "content": event['content']
        }))

    async def user_joined(self, event):
        await self.send(text_data=json.dumps({
            "type": "user_joined",
            "username": event["username"]
        }))

    async def user_left(self, event):
        await self.send(text_data=json.dumps({
            "type": "user_left",
            "username": event["username"]
        }))

    @sync_to_async
    def get_user_from_token(self):
        try:
            query_string = self.scope['query_string'].decode()
            query_params = parse_qs(query_string)
            token = query_params.get("token")

            if not token:
                return None
            
            access_token = AccessToken(token[0])
            user_id = access_token['user_id']

            from django.contrib.auth.models import User
            return User.objects.get(id=user_id)
        except:
            return None
        
    @sync_to_async
    def user_has_access(self):
        if Note.objects.filter(id=self.note_id, owner=self.user).exists():
            return True
        return Collaboration.objects.filter(note_id=self.note_id, user=self.user).exists()

    @sync_to_async
    def get_user_role(self):
        if Note.objects.filter(id=self.note_id, owner=self.user).exists():
            return "editor"
        
        collab = Collaboration.objects.filter(note_id=self.note_id, user=self.user).first()
        if collab:
            return collab.role
        return None

    @sync_to_async
    def get_note(self):
        try:
            return Note.objects.get(id=self.note_id)
        except Note.DoesNotExist:
            return None
        
    @sync_to_async
    def update_note(self, content):
        Note.objects.filter(id=self.note_id).update(content=content)