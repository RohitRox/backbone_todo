# encoding: utf-8
require 'rubygems'
require 'sinatra'
require 'sinatra/resources'
require 'json'
require 'data_mapper'
require 'pry'
require 'securerandom'


class Board
  include DataMapper::Resource
  property :id, Serial
  property :name, String
  property :private_url, String

  has n, :tasks

end

class Task
  include DataMapper::Resource
  property :id, Serial
  property :title, String
  property :status, String
  property :priority, String
  property :category, String
  property :created_at, DateTime
  belongs_to :board, :required => false

  # Task.all is all task without board
  # board.tasks gives tasks assosiated with board
  def self.public
    all(:board => nil)
  end
end

configure do
  DataMapper.setup(:default, ENV['DATABASE_URL'] || "sqlite3://#{Dir.pwd}/demo.db")
  DataMapper.finalize
  DataMapper.auto_upgrade!
end

class App < Sinatra::Base
  register Sinatra::Resources
  get '/' do
    @tasks = Task.public.to_a
    erb :index
  end

  get '/boards/:private_url' do
    @board = Board.all(:private_url => params[:private_url]).first
    if @board
      @tasks = @board.tasks
      erb :index
    else
      erb :not_found
    end
  end


  get '/tasks' do
    tasks = Task.public.to_a
    content_type :json
      tasks.to_json
  end

  post '/tasks' do
    params = JSON.parse(request.body.read)
    task = Task.create(params)
    content_type :json
      task.to_json
  end

  put '/tasks' do
    params = JSON.parse(request.body.read)
    task = Task.get(params['id'])
    task.update(params)
    content_type :json
      task.to_json
  end

  delete '/tasks/:id' do
    task = Task.get(params['id'])
    task.destroy
    content_type :json
      task.to_json
  end

  get '/boards' do
    board = Board.create({ :private_url => SecureRandom.uuid[0..7] })
    redirect "/boards/#{board.private_url}"
  end

  resource "boards/:private_url" do
    post "tasks" do
      board = Board.all(:private_url => params["private_url"]).first
      post_params = JSON.parse(request.body.read)
      post_params.merge!(:board => board)
      task = Task.create( post_params )
      content_type :json
        task.to_json
    end
    get "tasks" do
      board = Board.all(:private_url => params["private_url"]).first
      tasks = board.tasks
      content_type :json
        tasks.to_json
    end
    put 'tasks/:task_id' do
      params = JSON.parse(request.body.read)
      task = Task.get(params['id'])
      task.update(params)
      content_type :json
        task.to_json
    end
    delete 'tasks/:task_id' do
      task = Task.get(params['task_id'])
      task.destroy
      content_type :json
        task.to_json
    end
  end

end
