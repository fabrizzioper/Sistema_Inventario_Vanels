from flask import Blueprint, render_template, redirect, url_for

home_bp = Blueprint('home', __name__)

@home_bp.route('/home')
def home():
    return render_template('home.html')

@home_bp.route('/')
def index():
    return redirect(url_for('home.home'))  # Redirigir desde / a /home
