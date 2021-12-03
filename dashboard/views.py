from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from projects.models import Project, FeatureName, Weight
from layout.models import LayoutFeature
from account.models import User
from django.db.models import Avg, Count, Min, Sum
from projects.utils import AuthorizationManager

authorize = AuthorizationManager()


# Create your views here.

@login_required
def dashboard(request):
    # we request the user
    user = request.user

    if user.is_active and user.is_superuser:
        projects = Project.objects.all()
        nb_projects = Project.objects.all().count()
        productions = Project.objects.values_list('production', flat=True).distinct()
        group_by_value = {}
        for value in productions:
            group_by_value[value] = Project.objects.filter(production=value)
        prod_results = [0, 0, 0, 0]
        for i in range(4):
            prod_results[i] = len(group_by_value[str(i)]) if str(i) in group_by_value else 0

        types = Project.objects.values_list('type', flat=True).distinct()
        group_by_value = {}
        for value in types:
            group_by_value[value] = Project.objects.filter(type=value)
        type_results = [0, 0, 0]
        for i in range(3):
            type_results[i] = len(group_by_value[str(i)]) if str(i) in group_by_value else 0

        zones = Project.objects.values_list('zone', flat=True).distinct()
        group_by_value = {}
        for value in zones:
            group_by_value[value] = Project.objects.filter(zone=value)
        zone_results = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        for i in range(10):
            zone_results[i] = len(group_by_value[str(i)]) if str(i) in group_by_value else 0

        nb_features = FeatureName.objects.all().count()
        nb_flayouts = LayoutFeature.objects.all().count()
        nb_users = User.objects.all().count()
        weights_list = []
        wheigts = Weight.objects.all()

        for w in wheigts:
            if w.gross_weight_op != 0:
                weights_list.append(w.gross_weight_op)

        data = {
            'nb_users': nb_users,
            'nb_projects': nb_projects,
            'projects': projects,
            'nb_features': nb_features,
            'nb_flayouts': nb_flayouts,
            'prod_results': prod_results,
            'type_results': type_results,
            'zone_results': zone_results,
            'weight_results': weights_list,
            'section': 'dashboard'
        }
        return render(request, 'dashboard/dashboard.html', data)
    else:
        projects = []
        # we get all the project disregarding the user
        all_projects = Project.objects.all()
        for project in all_projects:
            # Here we filter those projects so we can return only the projects which the user has access to
            if authorize.has_access(project, user) and user.is_active:
                projects.append(project)
        print(projects)

        nb_projects = len(projects)

        productions = Project.objects.values_list('production', flat=True).distinct()
        group_by_value = {}
        for value in productions:
            group_by_value[value] = Project.objects.filter(production=value)
        prod_results = [0,0,0,0]
        for i in range(4):
            prod_results[i] = len(group_by_value[str(i)]) if str(i) in group_by_value else 0

        types = Project.objects.values_list('type', flat=True).distinct()
        group_by_value = {}
        for value in types:
            group_by_value[value] = Project.objects.filter(type=value)
        type_results = [0,0,0]
        for i in range(3):
            type_results[i] = len(group_by_value[str(i)]) if str(i) in group_by_value else 0

        zones = Project.objects.all().filter().values_list('zone', flat=True).distinct()
        group_by_value = {}
        for value in zones:
            group_by_value[value] = Project.objects.filter(zone=value)
        zone_results = [0,0,0,0,0,0,0,0,0,0]
        for i in range(10):
            zone_results[i] = len(group_by_value[str(i)]) if str(i) in group_by_value else 0

        nb_features = FeatureName.objects.all().count()
        nb_flayouts = LayoutFeature.objects.all().count()

        if user.account_type == '0':
            nb_users = User.objects.all().count()
        elif user.account_type == '1':
            b_u = user.business_unit
            nb_users = User.objects.all().filter(business_unit=b_u).count()
        elif user.account_type == '2':
            b_d = user.business_domain
            nb_users = User.objects.all().filter(business_domain=b_d).count()
        elif user.account_type == '3':
            w_s = user.work_stream
            nb_users = User.objects.all().filter(work_stream=w_s).count()
        else:
            nb_users = 1

        weights_list = []
        wheigts = Weight.objects.all()

        for w in wheigts:
            if w.gross_weight_op != 0:
                weights_list.append(w.gross_weight_op)

        data = {
            'nb_users': nb_users,
            'nb_projects': nb_projects,
            'projects': projects,
            'nb_features': nb_features,
            'nb_flayouts': nb_flayouts,
            'prod_results': prod_results,
            'type_results': type_results,
            'zone_results': zone_results,
            'weight_results': weights_list,
            'section': 'dashboard'
        }
        return render(request, 'dashboard/dashboard.html', data)

