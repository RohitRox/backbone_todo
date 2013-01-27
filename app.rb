# encoding: utf-8
require 'rubygems'
require 'sinatra'
require 'json'

class App < Sinatra::Base

  get '/' do
    erb :index
  end

  get '/tasks' do
    tasks = [{
      id: 1,
      title: "task1",
      done: false,
      priority: 'medium',
      category: 'personal'},
      {
      id: 2,
      title: "task2",
      done: true,
      priority: 'high',
      category: 'untitled'},
      {
      id: 3,
      title: "task3",
      done: false,
      priority: 'medium',
      category: 'office'},
      {
      id: 4,
      title: "mt atsj",
      done: false,
      priority: 'medium',
      category: 'office'}
    ]
    content_type :json
      tasks.to_json
  end

end
