from django.urls import path, include
from django.conf.urls import url
from django.contrib.auth import views as auth_views
from . import views


urlpatterns = [

    # we add the URL for the notes view, to output the list of notes.
    path('', views.missions, name="missions"),

    # we add the URL for the add view, to allow user to create notes.
    path('add/', views.addMission, name="addMission"),

    # we add the URL for the edit view, to allow user to update notes.
    path('edit/', views.editMission, name="editMission"),

    # we add the URL for the projects_delete to delete a project.
    path('<str:slug>/delete/', views.mission_delete, name="mission_delete"),

]
