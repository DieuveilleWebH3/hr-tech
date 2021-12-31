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

# My packages
from account.models import *
from hr_tech.settings import MEDIA_ROOT, BASE_DIR

Image.MAX_IMAGE_PIXELS = None


# Create your models here.

class Mission(models.Model):
    PRIME_CHOICES = (
        ('0', 'Pending'),
        ('1', 'Awarded'),
        ('2', 'Not Awarded'),
    )

    def get_upload_path(instance, filename):
        return 'missions/{0}/{1}'.format(instance.slug, filename)

    author = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
    title = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(unique=True)
    job_description = models.FileField(upload_to=get_upload_path, blank=True)
    prime = models.CharField(max_length=10, choices=PRIME_CHOICES, default='0')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    tracker = FieldTracker()

    def __str__(self):
        return str(self.title) + ' - ' + str(self.prime)

    class Meta:
        ordering = ['-updated_at']

    def save(self, *args, **kwargs):
        self.slug = slugify(self.title)

        super(Mission, self).save(*args, **kwargs)

    def get_absolute_url(self):
        return f"/mission/{self.slug}"

    def get_edit_url(self):
        return f"{self.get_absolute_url()}/edit"

