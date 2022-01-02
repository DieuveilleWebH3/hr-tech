from django.db import models 
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import Group


# Create your models here.

class User(AbstractUser):
    
    ACCOUNT_TYPE_CHOICES = ( 
        ('0', 'manager'),
        ('1', 'recruiter'),
        ('2', 'developer')
    )

    def get_upload_path(instance, filename):
        return 'users/{0}/{1}'.format(instance.username, filename)
    
    email = models.EmailField(unique=True)
    account_type = models.CharField(max_length=10, choices=ACCOUNT_TYPE_CHOICES, default='1')

    date_of_birth = models.DateField(blank=True, null=True)
    photo = models.ImageField(upload_to=get_upload_path, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username


class AllowRegistration(models.Model):

    name = models.CharField(max_length=120, db_index=True, unique=True, default='user_registration') 
    status = models.BooleanField(default=True)

    def __str__(self):
        if self.status: 
            return str(self.name) + str(' - abled')
        else:
            return str(self.name) + str(' - disabled')



