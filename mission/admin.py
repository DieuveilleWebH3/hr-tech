from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from .models import *

# Register your models here.


# NotesAdmin
@admin.register(Mission)
class MissionAdmin(ImportExportModelAdmin):
    prepopulated_fields = {"slug": ("title",)}
    list_display = ('id', 'author', 'title', 'slug', 'job_description', 'prime', 'created_at', 'updated_at')
    list_filter = ['created_at', 'author', 'prime']
    search_fields = ['title', 'job_description']


