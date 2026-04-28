from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Note



class UserTest(TestCase):

    def test_user_creation(self):
        user = User.objects.create_user(username="user1", password="pass123")
        self.assertEqual(user.username, "user1")

    def test_password_hashing(self):
        user = User.objects.create_user(username="user2", password="pass123")
        self.assertTrue(user.check_password("pass123"))




class NoteModelTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="test", password="1234")

    def test_note_creation(self):
        note = Note.objects.create(
            title="Test",
            content="Hello",
            owner=self.user   
        )
        self.assertEqual(note.title, "Test")

    def test_note_string(self):
        note = Note.objects.create(
            title="Title",
            content="Data",
            owner=self.user   
        )
        self.assertIn("Title", str(note))




class NoteAPITest(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="test", password="1234")
        self.client.force_authenticate(user=self.user)  

    def test_get_notes(self):
        response = self.client.get("/api/notes/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_note(self):
        response = self.client.post("/api/notes/", {
            "title": "New Note",
            "content": "Content"
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_update_note(self):
        note = Note.objects.create(
            title="Old",
            content="Text",
            owner=self.user  
        )

        response = self.client.put(f"/api/notes/{note.id}/", {
            "title": "Updated",
            "content": "Updated text"
        })
        self.assertIn(response.status_code, [200, 202])

    def test_delete_note(self):
        note = Note.objects.create(
            title="Delete",
            content="Text",
            owner=self.user  
        )

        response = self.client.delete(f"/api/notes/{note.id}/")
        self.assertIn(response.status_code, [200, 204])




class PermissionTest(APITestCase):

    def test_access_without_login(self):
        response = self.client.get("/api/notes/")
        self.assertIn(response.status_code, [401, 403])




class EdgeCaseTest(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="edge", password="1234")
        self.client.force_authenticate(user=self.user) 

    def test_large_content(self):
        response = self.client.post("/api/notes/", {
            "title": "Big",
            "content": "A" * 10000
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_invalid_note_id(self):
        response = self.client.get("/api/notes/9999/")
        self.assertIn(response.status_code, [404, 400])

    def test_multiple_notes(self):
        for i in range(5):
            Note.objects.create(
                title=f"Note {i}",
                content="Test",
                owner=self.user   
            )
        self.assertEqual(Note.objects.count(), 5)