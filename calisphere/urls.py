from django.conf.urls import patterns, include, url

urlpatterns = patterns('calisphere',
    url(r'^$', 'views.home', name='home'),
    url(r'^search/$', 'views.search', name='search'),
    url(r'^itemView/(?P<item_id>.*)/', 'views.itemView', name='itemView'),

    url(r'^collections/$', 'views.collectionsDirectory', name='collectionsDirectory'),
    url(r'^collections/(?P<collection_letter>[a-zA-Z]{1})/', 'views.collectionsAZ', name='collectionsAZ'),
    url(r'^collections/(?P<collection_id>\d*)/', 'views.collectionView', name='collectionView'),
    url(r'^collections/titleSearch/$', 'views.collectionsSearch', name='collectionsTitleSearch'),
    url(r'^collections/', 'views.collectionsSearch', name='collectionsSearch'),

    url(r'^institution/(?P<repository_id>.*)/', 'views.repositoryView', name='repositoryView'),
    url(r'^campus/(?P<campus_id>.*)/', 'views.campusView', name='campusView'),
    url(r'^institutions/uc-partners/$', 'views.campusDirectory', name='campusDirectory'),
    url(r'^institutions/statewide-partners/$', 'views.statewideDirectory', name='statewideDirectory'),

    url(r'about/$', 'views.home', name='about'),
    url(r'contact/$', 'views.home', name='contact'),
    url(r'help/$', 'views.home', name='help'),
    url(r'terms/$', 'views.home', name='termsOfUse'),
    url(r'privacy/$', 'views.home', name='privacyStatement'),
    url(r'siteMap/$', 'views.home', name='siteMap'),

    # AJAX HELPERS
    url(r'^relatedCollections/', 'views.relatedCollections', name='relatedCollections'),
    url(r'^carousel/', 'views.itemViewCarousel', name='carousel'),
)
