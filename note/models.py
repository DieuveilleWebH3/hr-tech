# Django packages
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


class Note(models.Model):
    LANGUAGE_CHOICES = (
        ('fr', 'Français'),
        ('en-uk', 'English (uk)'),
        ('en-us', 'English (usa)'),
    )

    author = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
    title = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(null=True, blank=True)
    language = models.CharField(max_length=10, choices=LANGUAGE_CHOICES, default='fr')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    tracker = FieldTracker()

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-updated_at']

    def save(self, *args, **kwargs):
        self.slug = slugify(self.title)

        super(Note, self).save(*args, **kwargs)

    def get_absolute_url(self):
        return f"/note/{self.slug}"

    def get_edit_url(self):
        return f"{self.get_absolute_url()}/edit"




'''

    Mission
        title 
        slug
        pdf fiche de poste
        commentaire
        prime 
    
    
    Candidat
        nom 
        prenom 
        email 
        titre 
        numero 	
        mission 
    
    
    Notes 
        title 
        slug 
        description 
        langue
	
'''