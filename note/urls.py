from django.urls import path, include
from django.conf.urls import url
from django.contrib.auth import views as auth_views
from . import views


urlpatterns = [

    # we add the URL for the notes view, to output the list of notes.
    path('', views.notes, name="notes"),

    # we add the URL for the add view, to allow user to create notes.
    path('add/', views.addNote, name="addNote"),

    # we add the URL for the edit view, to allow user to update notes.
    path('edit/', views.editNote, name="editNote"),

    # we add the URL for the projects_delete to delete a project.
    path('<str:slug>/delete/', views.note_delete, name="note_delete"),

]
