from django.shortcuts import render, redirect, get_object_or_404, reverse
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods, require_POST, require_GET
from django.contrib import messages
from .models import *
from .forms import *
from django.views.decorators.csrf import csrf_protect, csrf_exempt
from django.core.files.storage import FileSystemStorage
import datetime
from django.urls import reverse
import requests
from django.db.models import Q


# Create your views here.

def missions(request):
    mission_list = Mission.objects.all()
    mForm = MissionAddForm()

    template_name = 'mission/missions.html'
    context = {
        'mission_list': mission_list,
        'mForm': mForm
    }
    # we return the template with the variables in context
    return render(request, template_name, context)


@login_required(redirect_field_name='login')
def editMission(request):
    user = request.user

    # form = NoteAddForm(data=request.POST)

    if request.method == 'POST':
        form = request.POST

    return True


@login_required(redirect_field_name='login')
@require_POST
@require_http_methods(["POST"])
def addMission(request):
    user = request.user

    form = MissionAddForm(data=request.POST)

    if form.is_valid():
        mForm = form.save(commit=False)
        mForm.author = user

        mForm.save()

        messages.success(request, 'Successfully added mission.')

    else:
        messages.warning(request, 'An error has occurred ! Please input the right information.')

    return redirect('missions')


# We create a view to delete a note
@login_required(redirect_field_name='login')
def mission_delete(request, slug):
    # We request a user
    user = request.user
    # we retrieve the slug to retrieve the chosen project
    mission = get_object_or_404(Mission, slug=slug)

    # We check if the current user has superuser status or has access to the project
    if user.is_active and (user.is_superuser or mission.author == user):
        # We delete the note
        mission.delete()
    else:
        messages.warning(request, 'Sorry you don\'t have permission to delete this mission! please contact your admin.')
    return redirect("missions")

