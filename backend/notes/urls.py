from django.urls import path
from .views import NoteListCreateView, NoteDetailView, ShareNoteView, SharedNotesView, note_versions, version_detail, save_version

urlpatterns = [
    path('notes/', NoteListCreateView.as_view(), name='note-list-create'),
    path('notes/<int:pk>/', NoteDetailView.as_view(), name='note-detail'),
    path('notes/<int:pk>/share/', ShareNoteView.as_view()),
    path('shared-notes/', SharedNotesView.as_view()),
    path('notes/<int:note_id>/versions/', note_versions),
    path('versions/<int:version_id>/', version_detail),
    path('notes/<int:note_id>/save-version/', save_version),
]