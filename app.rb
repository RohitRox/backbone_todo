# encoding: utf-8
require 'rubygems'
require 'sinatra'
require 'json'
require 'data_mapper'
require 'pry'

class Task
  include DataMapper::Resource
  property :id, Serial
  property :title, String
  property :status, String
  property :priority, String
  property :category, String
  property :created_at, DateTime
end

configure do
  DataMapper.setup(:default, ENV['DATABASE_URL'] || "sqlite3://#{Dir.pwd}/demo.db")
  DataMapper.finalize
  DataMapper.auto_upgrade!
end

class App < Sinatra::Base

  TASKS = [{
      id: 1,
      title: "task1",
      status: "Completed",
      priority: 'medium',
      category: 'personal',
      created_at: "12:00 PM, Feb 23, 2012"
      },
      {
      id: 2,
      title: "task2",
      status: "Not-Completed",
      priority: 'high',
      category: 'untitled',
      created_at: "12:00 PM, Feb 23, 2012"
      },
      {
      id: 3,
      title: "task3",
      status: "Completed",
      priority: 'medium',
      category: 'office',
      created_at: "12:00 PM, Feb 23, 2012"
      },
      {
      id: 4,
      title: "mt atsj",
      status: "Not-Completed",
      priority: 'medium',
      category: 'office',
      created_at: "12:00 PM, Feb 23, 2012"}
    ]

  get '/' do
    @tasks = Task.all.to_a
    erb :index
  end

  get '/tasks' do
    tasks = Task.all.to_a
    content_type :json
      tasks.to_json
  end

  post '/tasks' do
    params = JSON.parse(request.body.read)
    task = Task.create(params)
    content_type :json
      task.to_json
  end

end
