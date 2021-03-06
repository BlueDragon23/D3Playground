import os
import pandas
import sqlite3
from flask import Flask, request, session, g, redirect, url_for, abort, \
     render_template, flash

app = Flask(__name__)
app.config.from_object(__name__)


def load_purchases():
    purchases = pandas.read_csv("../PurchaseHistory.csv")
    return purchases


@app.route('/')
def show_shapes():
    return render_template('index.html')


@app.route('/charts')
def show_charts():
    return render_template('graphs.html')


# consider making this authenticated
@app.route('/purchases')
def show_purchases():
    purchases = load_purchases()
    return render_template('purchases.html', dates=list(purchases["Date"].values),
                           costs=list(purchases["Purchase Amount"].values),
                           stores=list(purchases["Store"].values))

@app.route('/purchases-dev')
def show_purchases_dev():
    purchases = load_purchases()
    return render_template('purchases2.html', dates=list(purchases["Date"].values),
                           costs=list(purchases["Purchase Amount"].values),
                           stores=list(purchases["Store"].values))


if __name__ == "__main__":
    app.run(debug=True)
