from django.urls import path
from .views import NoteListCreateView, NoteDetailView, ShareNoteView, SharedNotesView

urlpatterns = [
    path('notes/', NoteListCreateView.as_view(), name='note-list-create'),
    path('notes/<int:pk>/', NoteDetailView.as_view(), name='note-detail'),
    path('notes/<int:pk>/share/', ShareNoteView.as_view()),
    path('shared-notes/', SharedNotesView.as_view()),
]