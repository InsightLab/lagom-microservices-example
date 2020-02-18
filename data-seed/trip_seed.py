# -*- coding: utf-8 -*-
import pandas as pd
import os
import json
import io
import requests
import zipfile
import pymongo

RESULT_DIR = '.'

GTFS_URL = 'http://www.sptrans.com.br/umbraco/Surface/PerfilDesenvolvedor/BaixarGTFS'

gtfs_file = requests.get(GTFS_URL)
zip_ref = zipfile.ZipFile(io.BytesIO(gtfs_file.content))

trips = pd.read_csv(io.BytesIO(zip_ref.read("trips.txt")),
                    index_col='shape_id')
stops = pd.read_csv(io.BytesIO(zip_ref.read("stops.txt")),
                    index_col='stop_id')
stops_times = pd.read_csv(io.BytesIO(zip_ref.read("stop_times.txt")))
shapes = pd.read_csv(io.BytesIO(zip_ref.read("shapes.txt")))

shapes_by_id = shapes.groupby('shape_id')

def translate_shape(shape):
  _shape = {}
  _shape['lat']  = shape['shape_pt_lat']
  _shape['lng']  = shape['shape_pt_lon']
  _shape['dist'] = shape['shape_dist_traveled']
  return _shape

trips_with_shapes = []
for shape_id in shapes_by_id.groups:
  data = shapes_by_id.get_group(shape_id)
  shape_path = sorted(data.to_dict(orient='records'),
                      key=lambda x: x['shape_pt_sequence'])
  shape_path = list(map(translate_shape, shape_path))
  trip = trips.loc[shape_id].to_dict()
  del trip['service_id']
  trip['direction_id'] = int(trip['direction_id'])
  trip['shape_id'] = shape_id
  trip['shape_path'] = shape_path
  trips_with_shapes.append(trip)

lines_by_stop = stops_times.groupby('stop_id')

stops_with_lines = []
for stop_id in lines_by_stop.groups:
  data = lines_by_stop.get_group(stop_id)
  if stop_id in stops.index:
    stop = stops.loc[stop_id].to_dict()
    stops_with_lines.append({
        'stop_id': stop_id,
        'name': stop['stop_name'],
        'trips': list(data['trip_id'].unique()),
        'location': {
            'type': "Point",
            'coordinates': [stop['stop_lon'], stop['stop_lat']]
        }
    })

mongo_client = pymongo.MongoClient(os.environ['MONGO_HOST'], int(os.environ['MONGO_PORT']))
mongo_db = mongo_client[os.environ['MONGO_DB']]
stops_col = mongo_db['stops']
trips_col = mongo_db['trips']

stops_col.delete_many({})
stops_col.insert_many(stops_with_lines)
trips_col.delete_many({})
trips_col.insert_many(trips_with_shapes)