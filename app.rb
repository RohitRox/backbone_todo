# encoding: utf-8
require 'rubygems'
require 'sinatra'
require 'json'

class App < Sinatra::Base

  TASKS = [{
      id: 1,
      title: "task1",
      done: false,
      priority: 'medium',
      category: 'personal',
      created_at: "12:00 PM, Feb 23, 2012"
      },
      {
      id: 2,
      title: "task2",
      done: true,
      priority: 'high',
      category: 'untitled',
      created_at: "12:00 PM, Feb 23, 2012"
      },
      {
      id: 3,
      title: "task3",
      done: false,
      priority: 'medium',
      category: 'office',
      created_at: "12:00 PM, Feb 23, 2012"
      },
      {
      id: 4,
      title: "mt atsj",
      done: false,
      priority: 'medium',
      category: 'office',
      created_at: "12:00 PM, Feb 23, 2012"}
    ]

  get '/' do
    @tasks = TASKS.to_json
    erb :index
  end

  get '/tasks' do
    tasks = TASKS
    content_type :json
      tasks.to_json
  end

end
