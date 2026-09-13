.PHONY: setup train evaluate run clean

setup:
	python3 -m venv venv
	./venv/bin/pip install -r requirements.txt
	@echo "Setup complete. Virtual environment ready."

train:
	./venv/bin/python src/agent/train_classifier.py
	./venv/bin/python src/agent/build_index.py
	@echo "Training and indexing complete."

evaluate:
	./venv/bin/python src/evaluation/evaluate_agent.py
	@echo "Evaluation complete. See artifacts/metrics/end_to_end_eval.json"

run:
	./venv/bin/python run.py --mode demo

clean:
	rm -rf __pycache__ .pytest_cache models/*.pkl models/*.npy
