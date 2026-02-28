from rest_framework import serializers
from .models import Note, Collaboration
from django.contrib.auth.models import User

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'title', 'content', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class CollaborationSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)

    class Meta:
        model = Collaboration
        fields = ['username', 'role']

    def create(self, validated_data):
        username = validated_data['username']
        user = User.objects.get(username=username)
        note = self.context['note']

        collaboration = Collaboration.objects.create(
            note=note, user=user, role=validated_data['role']
        )
        return collaboration