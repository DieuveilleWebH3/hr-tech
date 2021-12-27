"""hr_tech URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    path('account/', include('account.urls')),
    # path('', include('account.urls')),

    path('', include('dashboard.urls')),

    # path('candidat/', include(('candidat.urls', 'candidat'), namespace='candidat')),
    path('candidat/', include('candidat.urls')),

    # path('mission/', include(('mission.urls', 'mission'), namespace='mission')),
    path('mission/', include('mission.urls')),

    # path('note/', include(('note.urls', 'note'), namespace='note')),
    path('note/', include('note.urls')),

    # for unauthorized access dynamic translation
    path('gtts/', include('gTTS.urls')),
    # for user authorized dynamic translation
    path('gtts_auth/', include('gTTS.urls_auth')),
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

""" 
handler404 = 'dashboard.views.error_404'
handler500 = 'dashboard.views.error_500'
"""
