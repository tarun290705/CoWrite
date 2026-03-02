import json
from urllib.parse import parse_qs
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Note, Collaboration
from asgiref.sync import sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken

class NoteConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.note_id = self.scope['url_route']['kwargs']['note_id']
        self.group_name = f'note_{self.note_id}'
        self.user = await self.get_user_from_token()

        if not self.user:
            await self.close()
            return
        
        has_access = await self.user_has_access()

        if not has_access:
            await self.close()
            return

        note = await self.get_note()
        if not note:
            await self.close()
            return

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        await self.send(text_data=json.dumps({
            "content": note.content
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            content = data.get("content", "")
        except:
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
            'content': event['content']
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
    def get_note(self):
        try:
            return Note.objects.get(id=self.note_id)
        except Note.DoesNotExist:
            return None
        
    @sync_to_async
    def update_note(self, content):
        Note.objects.filter(id=self.note_id).update(content=content)