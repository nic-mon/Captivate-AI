## COPY OF THE FLASK APP USED FOR ML STUFF

from flask import Flask, request
app = Flask(__name__)

import gensim
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

model = gensim.models.KeyedVectors.load_word2vec_format('/var/www/Flask/Flask/static/GoogleNews-vectors-negative300.bin', binary=True)

def read_topics():
        filename = '/var/www/Flask/Flask/static/topics.txt'
        with open(filename,'r') as f:
                topics = f.read().split('\n')
        topics = [t.replace(" ","").replace("'","").lower() for t in topics]
        return topics

def get_closest_topic(word):
        try:
                wv = model.wv[word]
        except:
                return None
        topics = read_topics()
        topic_vecs = np.array([model.wv[t] for t in topics])
        similarities = cosine_similarity(topic_vecs,[wv])
        index = np.argmax(similarities)
        return topics[index]

def get_topic_top10(topic):
        #must be real topic
        with open('/var/www/Flask/Flask/static/top10/{}.txt'.format(topic), 'r') as f:
                top10 = f.read().split('\n')
        print(top10)
        top10 = [q for q in top10[1:] if q]
        return topic + '|' + '|'.join(list(reversed(top10)))

@app.route('/')
def hello():
    return 'Hello There '

@app.route('/quotes', methods=['POST','GET'])
def get_quotes():
    word = request.args.get('word')
    topic = get_closest_topic(word)
    if topic: return get_topic_top10(topic)
    else: return 'Word not found'

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug='True')
