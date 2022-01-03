from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from .models import *

# Register your models here.


# NotesAdmin
@admin.register(Candidates)
class CandidateAdmin(ImportExportModelAdmin):
    list_display = ('id', 'author', 'first_name', 'last_name', 'email', 'title', 'resume', 'phone_number', 'mission', 'created_at', 'updated_at')
    list_filter = ['created_at', 'author', 'mission']
    search_fields = ['first_name', 'last_name', 'title', 'mission']


