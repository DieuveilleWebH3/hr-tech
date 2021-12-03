from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from account.models import User
from django.db.models import Avg, Count, Min, Sum


# Create your views here.

@login_required
def dashboard(request):
    # we request the user
    user = request.user

    return render(request, 'dashboard/dashboard.html')

