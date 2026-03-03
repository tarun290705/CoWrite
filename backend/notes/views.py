from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Note, Collaboration, NoteVersion
from .serializers import NoteSerializer, CollaborationSerializer
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes

class NoteListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notes = Note.objects.filter(owner=request.user)
        serializer = NoteSerializer(notes, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = NoteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class NoteDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        note = Note.objects.filter(pk=pk, owner=user).first()
        if note:
            return note
        collaboration = Collaboration.objects.filter(note_id=pk, user=user).first()
        if collaboration:
            return collaboration.note
        return get_object_or_404(Note, pk=-1)
    
    def get(self, request, pk):
        note = self.get_object(pk, request.user)
        serializer = NoteSerializer(note)
        return Response(serializer.data)
    
    def put(self, request, pk):
        note = self.get_object(pk, request.user)
        serializer = NoteSerializer(note, data=request.data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        note = self.get_object(pk, request.user)
        note.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class ShareNoteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        note = get_object_or_404(Note, pk=pk, owner=request.user)
        serializer = CollaborationSerializer(data=request.data, context={'note': note})
        if serializer.is_valid():
            serializer.save()
            return Response({"msg": "Note shared successfully"}, status=201)
        return Response(serializer.errors, status=400)
    
class SharedNotesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        collaborations = Collaboration.objects.filter(user=request.user)
        notes = [collab.note for collab in collaborations]
        serializer = NoteSerializer(notes, many=True)
        return Response(serializer.data)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def note_versions(request, note_id):
    versions = NoteVersion.objects.filter(note_id=note_id).order_by('-created_at')

    data = [
        {
            "id": v.id,
            "created_at": v.created_at
        }
        for v in versions
    ]
    
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def version_detail(request, version_id):
    version = NoteVersion.objects.get(id=version_id)

    return Response({
        "content": version.content,
        "created_at": version.created_at
    })

@api_view(['POST'])
def save_version(request, note_id):
    try:
        note = Note.objects.get(id=note_id)
    except Note.DoesNotExist:
        return Response({"error": "Note not found"}, status=404)
    
    NoteVersion.objects.create(note=note, content=note.content)

    return Response({"msg": "Version saved"})