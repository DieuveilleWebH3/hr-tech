from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.urls import reverse
from model_utils import FieldTracker
from django.contrib.staticfiles.storage import staticfiles_storage

# Custom packages
import os
import re

from PIL import Image
import concurrent
import time
import datetime
from tqdm import tqdm

from phonenumber_field.modelfields import PhoneNumberField

# My packages
from account.models import *
from mission.models import *

from hr_tech.settings import MEDIA_ROOT, BASE_DIR

Image.MAX_IMAGE_PIXELS = None


# Create your models here.

class Candidates(models.Model):

    def get_upload_path(filename):
        return 'candidates/{0}'.format(filename)

    author = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
    first_name = models.CharField(max_length=120)
    last_name = models.CharField(max_length=120)
    email = models.EmailField()  # models.CharField(max_length=250)
    title = models.CharField(max_length=250)

    resume = models.FileField(upload_to='candidates/', blank=True)

    phone_number = PhoneNumberField(blank=True, null=True)

    mission = models.ForeignKey(Mission, related_name='mission', null=True, on_delete=models.SET_NULL)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    tracker = FieldTracker()

    def __str__(self):
        return str(self.first_name) + ' - ' + str(self.last_name) + ' - ' + str(self.title)

    class Meta:
        ordering = ['-updated_at']

    def get_absolute_url(self):
        return f"/candidates/{self.id}"

    def get_edit_url(self):
        return f"{self.get_absolute_url()}/edit"

