import spacy
import sys
import json

nlp = spacy.load("en_core_web_sm")

text = sys.argv[1]

doc = nlp(text)

entities = []

for ent in doc.ents:
    entities.append({
        "text": ent.text,
        "label": ent.label_
    })

print(json.dumps(entities))