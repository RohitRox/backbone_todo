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
    board = Board.all(:private_url => params[:private_url]).first
    if board
      @tasks = board.tasks
      erb :index
    else
      erb :not_found
    end
  end


  get '/tasks' do
    if is_on_board?
      tasks = Board.all(:private_url => params[:private_url]).first.tasks.all.to_a
    else
      tasks = Task.public.to_a
    end
    content_type :json
      tasks.to_json
  end

  post '/tasks' do
    binding.pry
    params = JSON.parse(request.body.read)
    if is_on_board?
      board = Board.all(:private_url => params[:private_url]).first
      task = Task.create(params.merge!(:board => board))
    else
      task = Task.create(params)
    end
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

  resource "boards/:board_id" do
    post "tasks" do
      binding.pry
    end
  end


  private

  def is_on_board?
    params[:private_url] ? true : false
  end

end
