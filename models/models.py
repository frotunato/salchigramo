#-*- coding: utf-8 -*-

from odoo import models, fields, api, http
import requests


class Salchigramo (models.Model):
	_name = 'salchigramo.salchigramo'
	_description = 'desc Salchigramo.Salchigramo'
	#_inherit = 'product.product'
	#_inherits = {
	#	'product.product': 'product_id',
	#	'product.product': 'product_volume',
	#}

	name = fields.Char()
	#value = fields.Integer()
	#value2 = fields.Float(compute="_value_pc", store=True)
	description = fields.Text()
	#product_val = fields.Many2One()
	platform = fields.Char()
	published = fields.Boolean()
	image = fields.Binary("Image")
	model_template_id = fields.Many2one('product.template', 'V.O.')
	#campo1 = fields.Char(string="campo1", store=True, related='product.template.id')
	#productId = fields.Many2One('product.product_template', 'Prueba', string="Esto es una prueba")
	@api.model
	def create(self, vals):
		res = super(Salchigramo, self).create(vals)
		#resp = requests.get('http://192.168.249.1:8000/')
		resp = requests.post('http://192.168.249.1:8000/', data={'image': res['image']})
		#resp = requests.post('http://192.168.249.1:8000/', data={'image': 'test'})

		#data = dump.dump_all(resp)
		return res
	#@api.depends('value')


	#def write(self, cr, uid, ids, vals, context=None):
	# Function calls and such here
	# return super(sale_order, self).write(cr, uid, ids, vals, context=context)

	
	#def _value_pc (self):	
	#	for record in self:
	#		record.value2 = float(record.value) / 100

class SalchigramoInstagram (models.Model):
	_inherit = 'salchigramo.salchigramo'

class SalchigramoFacebook (models.Model):
	_inherit = 'salchigramo.salchigramo'

class SalchigramoTwitter (models.Model):
	_inherit = 'salchigramo.salchigramo'