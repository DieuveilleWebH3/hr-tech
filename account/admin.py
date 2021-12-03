from django.contrib import admin
# from import_export.admin import ImportExportModelAdmin
from .models import *


# Register your models here.


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['id', 'first_name', 'last_name', 'username', 'email', 'account_type']
    list_filter = ['account_type', ] 
    search_fields = ['username',  'first_name', 'last_name', 'email', ]
    
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        is_superuser = request.user.is_superuser
        disabled_fields = set()  # type: set[str]

        if not is_superuser:
            disabled_fields |= {
                'user',
                'is_superuser',
            }

        for f in disabled_fields:
            if f in form.base_fields:
                form.base_fields[f].disabled = True

        return form


@admin.register(AllowRegistration)
class AllowRegistrationAdmin(admin.ModelAdmin):
    list_display = ('name', 'status', )
    list_filter = ['name', 'status', ]
    search_fields = ['name', 'status', ]



