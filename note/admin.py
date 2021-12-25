from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from .models import *

# Register your models here.


# NotesAdmin
@admin.register(Note)
class NoteAdmin(ImportExportModelAdmin):
    list_display = ('id', 'author', 'title', 'slug', 'description', 'language', 'created_at', 'updated_at')
    list_filter = ['created_at', 'author', 'language']
    search_fields = ['title', 'description']


