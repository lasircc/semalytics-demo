# Use Python 3.7.0
FROM python:3.7.0

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
#RUN pip install --upgrade setuptools
RUN pip install -r requirements.txt

# Run app.py when the container launches
CMD ["jupyter", "notebook", "--ip=0.0.0.0", "--no-browser", "--allow-root"]