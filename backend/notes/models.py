from django.db import models
from django.contrib.auth.models import User

class Note(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField(blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
    
class Collaboration(models.Model):
    ROLE_CHOICES = (
        ('viewer', 'Viewer'),
        ('editor', 'Editor'),
    )

    note = models.ForeignKey(Note, on_delete=models.CASCADE, related_name='collaborations')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shared_notes')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)

    def __str__(self):
        return f"{self.user.username} - {self.note.title} ({self.role})"