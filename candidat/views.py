from django.shortcuts import render, redirect, get_object_or_404, reverse
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods, require_POST, require_GET
from django.contrib import messages
from .models import *
from .forms import *
from mission.models import *
from django.views.decorators.csrf import csrf_protect, csrf_exempt
from django.core.files.storage import FileSystemStorage
import datetime
from django.urls import reverse
import requests
import shutil
from django.db.models import Q


# Create your views here.

def candidates(request):
    missions = Mission.objects.all()
    candidate_list = Candidates.objects.all()
    cForm = CandidateAddForm()

    template_name = 'candidat/candidates.html'
    context = {
        'candidate_list': candidate_list,
        'cForm': cForm,
        'missions': missions
    }
    # we return the template with the variables in context
    return render(request, template_name, context)


@login_required(redirect_field_name='login')
def editCandidate(request):
    user = request.user

    # form = NoteAddForm(data=request.POST)

    if request.method == 'POST':
        form = request.POST

    return True


@login_required(redirect_field_name='login')
@require_POST
@require_http_methods(["POST"])
def addCandidate(request):
    user = request.user

    form = CandidateAddForm(data=request.POST, files=request.FILES)

    if form.is_valid():
        cForm = form.save(commit=False)
        cForm.author = user

        # cForm.save()

        mission_id = request.POST.get('mission')

        try:
            mission = Mission.objects.get(id=int(mission_id))
            cForm.mission = mission
        except Mission.DoesNotExist:
            pass

        cForm.save()

        messages.success(request, 'Successfully added candidate.')

    else:
        messages.warning(request, 'An error has occurred ! Please input the right information.')

    return redirect('candidates')


# We create a view to delete a mission
@login_required(redirect_field_name='login')
def candidate_delete(request, id):
    # We request a user
    user = request.user

    # we retrieve the slug to retrieve the chosen mission
    id = int(id)
    candidate = get_object_or_404(Candidates, id=id)

    # We check if the current user has superuser status or has access to the mission
    if user.is_active and (user.is_superuser or candidate.author == user):
        # We delete the mission
        candidate.delete()

        messages.success(request, 'Successfully deleted candidate.')
    else:
        messages.warning(request, 'Sorry you don\'t have permission to delete this candidate! please contact your admin.')
    return redirect("candidates")

