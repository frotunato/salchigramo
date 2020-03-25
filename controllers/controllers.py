# -*- coding: utf-8 -*-
import logging
#import urllib3
#import json
import requests

from odoo import http
from requests_toolbelt.utils import dump

#_logger = logging.getLogger(__name__)
#httpk = urllib3.PoolManager()
#URL = 'https://jsonplaceholder.typicode.com/posts/1'


class Salchigramo(http.Controller):
	@http.route('/salchigramo/salchigramo/', auth='public')
	def index(self, **kw):
		#resp = requests.get('http://192.168.249.1:8000/')
		#data = dump.dump_all(resp)
		#datas = httpk.request('GET', URL)
		#datas = json.loads(datas.data.decode('utf-8'))
		_logger.debug("basura LOGGING " + data.decode('utf-8'))
		return data.decode('utf-8')

		@http.route('/salchigramo/salchigramo/objects/', auth='public')
		def list(self, **kw):
			return http.request.render('salchigramo.listing', {
				'root': '/salchigramo/salchigramo',
				'objects': http.request.env['salchigramo.salchigramo'].search([]),
				})
			
			@http.route('/salchigramo/salchigramo/objects/<model("salchigramo.salchigramo"):obj>/', auth='public')
			def object(self, obj, **kw):
				return http.request.render('salchigramo.object', {
					'object': obj
					})