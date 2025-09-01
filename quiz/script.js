(function () {
	'use strict';

	// Category question pools
	const questionPools = {
		web: [
			{ question: 'Which language runs in a web browser?', options: ['Java', 'C', 'Python', 'JavaScript'], answerIndex: 3, hint: 'It is the language of the web.' },
			{ question: 'What protocol does the web primarily use?', options: ['FTP', 'SMTP', 'HTTP', 'SSH'], answerIndex: 2, hint: 'It starts with H.' },
			{ question: 'What is used to style web pages?', options: ['HTML', 'CSS', 'SQL', 'Python'], answerIndex: 1 },
			{ question: 'What does URL stand for?', options: ['Universal Resource Locator', 'Uniform Resource Locator', 'Unified Routing Level', 'Universal Routing Link'], answerIndex: 1 },
			{ question: 'What is responsive design primarily about?', options: ['Server speed', 'Ad placement', 'Adapting layout to screen size', 'SEO'], answerIndex: 2 }
		],
		js: [
			{ question: 'Which of the following is NOT a JavaScript data type?', options: ['Number', 'String', 'Character', 'Boolean'], answerIndex: 2 },
			{ question: 'How do you write an arrow function returning 5?', options: ['() => 5', '=> 5', '() => {5}', '(5) =>'], answerIndex: 0 },
			{ question: 'Which method converts JSON to object?', options: ['JSON.parse()', 'JSON.toObject()', 'JSON.stringify()', 'Object.parse()'], answerIndex: 0 },
			{ question: 'Which keyword declares a block-scoped variable?', options: ['var', 'let', 'def', 'static'], answerIndex: 1 },
			{ question: 'What does `Array.prototype.map` return?', options: ['A single value', 'A new array', 'A Promise', 'An iterator'], answerIndex: 1 }
		],
		css: [
			{ question: 'What does CSS stand for?', options: ['Central Style Sheets', 'Cascading Style Sheets', 'Cascading Simple Sheets', 'Cars SUVs Sailboats'], answerIndex: 1, hint: 'Cascading is the key.' },
			{ question: 'Which property changes text color?', options: ['font-style', 'text-color', 'font-color', 'color'], answerIndex: 3 },
			{ question: 'Flexbox main axis is controlled by?', options: ['align-items', 'justify-content', 'flex-grow', 'gap'], answerIndex: 1 },
			{ question: 'Unit relative to root font-size?', options: ['em', 'px', 'rem', 'vh'], answerIndex: 2 },
			{ question: 'Which at-rule is used for media queries?', options: ['@screen', '@break', '@media', '@query'], answerIndex: 2 }
		],
		html: [
			{ question: 'What does HTML stand for?', options: ['Hypertext Markup Language', 'Hyper Trainer Marking Language', 'HyperText Marketing Language', 'Hyper Tool Multi Language'], answerIndex: 0 },
			{ question: 'Correct tag for the largest heading?', options: ['<heading>', '<h1>', '<h6>', '<head>'], answerIndex: 1 },
			{ question: 'Self-closing tag?', options: ['<div>', '<span>', '<img>', '<p>'], answerIndex: 2 },
			{ question: 'Which tag includes JavaScript?', options: ['<javascript>', '<script>', '<js>', '<code>'], answerIndex: 1 },
			{ question: 'Which attribute sets alternative text for images?', options: ['title', 'alt', 'label', 'desc'], answerIndex: 1 }
		]
	};

	// Elements
	const welcomeCard = document.getElementById('welcomeCard');
	const startBtn = document.getElementById('startBtn');
	const categoryCard = document.getElementById('categoryCard');
	const backToWelcome = document.getElementById('backToWelcome');
	const loadingMask = document.getElementById('loadingMask');

	const quizCard = document.querySelector('.quiz');
	const questionText = document.getElementById('questionText');
	const optionsList = document.getElementById('optionsList');
	const progressBar = document.getElementById('progressBar');
	const progressText = document.getElementById('progressText');
	const hintArea = document.getElementById('hintArea');
	const prevBtn = document.getElementById('prevBtn');
	const nextBtn = document.getElementById('nextBtn');
	const submitBtn = document.getElementById('submitBtn');
	const restartBtn = document.getElementById('restartBtn');
	const resultCard = document.getElementById('resultCard');
	const scoreValue = document.getElementById('scoreValue');
	const timeValue = document.getElementById('timeValue');
	const accuracyValue = document.getElementById('accuracyValue');
	const reviewList = document.getElementById('reviewList');
	const reviewToggle = document.getElementById('reviewToggle');
	const retryBtn = document.getElementById('retryBtn');
	const themeToggle = document.getElementById('themeToggle');

	// State
	let currentIndex = 0;
	let currentCategory = null;
	let quizQuestions = [];
	let selectedAnswers = [];
	let quizStartedAt = Date.now();
	let timerInterval = null;
	let reviewVisible = false;

	function hideAll() {
		welcomeCard.hidden = true;
		categoryCard.hidden = true;
		quizCard.hidden = true;
		resultCard.hidden = true;
	}
	function showWelcome() { hideAll(); welcomeCard.hidden = false; }
	function showCategories() { hideAll(); categoryCard.hidden = false; }
	function showQuiz() { hideAll(); quizCard.hidden = false; }
	function showLoading(show) { loadingMask.hidden = !show; }

	function startTimer() {
		quizStartedAt = Date.now();
		if (timerInterval) clearInterval(timerInterval);
		timerInterval = setInterval(updateTimer, 1000);
	}
	function stopTimer() { if (timerInterval) clearInterval(timerInterval); }
	function formatDuration(ms) {
		const totalSeconds = Math.floor(ms / 1000);
		const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
		const seconds = String(totalSeconds % 60).padStart(2, '0');
		return `${minutes}:${seconds}`;
	}
	function updateTimer() { const elapsed = Date.now() - quizStartedAt; timeValue.textContent = formatDuration(elapsed); }

	function renderQuestion() {
		const q = quizQuestions[currentIndex];
		questionText.textContent = q.question;
		progressText.textContent = `Question ${currentIndex + 1} of ${quizQuestions.length}`;
		progressBar.style.width = `${((currentIndex) / quizQuestions.length) * 100}%`;

		optionsList.innerHTML = '';
		q.options.forEach((opt, idx) => {
			const li = document.createElement('li');
			li.className = 'option';
			li.setAttribute('role', 'option');
			li.setAttribute('tabindex', '0');
			li.setAttribute('aria-selected', String(selectedAnswers[currentIndex] === idx));
			li.addEventListener('click', () => selectOption(idx));
			li.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectOption(idx); }});

			const badge = document.createElement('div');
			badge.className = 'option__index';
			badge.textContent = String(idx + 1);

			const text = document.createElement('div');
			text.className = 'option__text';
			text.textContent = opt;

			const state = document.createElement('div');
			state.className = 'option__state';
			state.textContent = selectedAnswers[currentIndex] === idx ? '✓' : '';

			li.appendChild(badge);
			li.appendChild(text);
			li.appendChild(state);
			optionsList.appendChild(li);
		});

		prevBtn.disabled = currentIndex === 0;
		nextBtn.hidden = currentIndex === quizQuestions.length - 1;
		submitBtn.hidden = currentIndex !== quizQuestions.length - 1;
		restartBtn.hidden = false;
		hintArea.hidden = true;
	}

	function selectOption(idx) {
		selectedAnswers[currentIndex] = idx;
		renderQuestion();
	}
	function showHint() {
		const q = quizQuestions[currentIndex];
		hintArea.textContent = q.hint || '';
		hintArea.hidden = !q.hint;
	}
	function allAnswered() { return selectedAnswers.every(a => a !== null); }

	function gradeQuiz() {
		let correctCount = 0;
		quizQuestions.forEach((q, i) => { if (selectedAnswers[i] === q.answerIndex) correctCount++; });
		return { correctCount, total: quizQuestions.length, accuracy: Math.round((correctCount / quizQuestions.length) * 100) };
	}

	function showResults() {
		stopTimer();
		showLoading(false);
		hideAll();
		resultCard.hidden = false;

		const { correctCount, total, accuracy } = gradeQuiz();
		scoreValue.textContent = `${correctCount}/${total}`;
		accuracyValue.textContent = `${accuracy}%`;
		const elapsed = Date.now() - quizStartedAt;
		timeValue.textContent = formatDuration(elapsed);

		const subtitle = document.getElementById('resultSubtitle');
		subtitle.textContent = accuracy >= 80 ? 'Excellent work! 🎉' : accuracy >= 50 ? 'Nice effort! Keep practicing.' : 'Keep going, you will improve!';

		reviewList.innerHTML = '';
		quizQuestions.forEach((q, i) => {
			const item = document.createElement('div');
			item.className = 'review__item';
			const question = document.createElement('h4');
			question.className = 'review__question';
			question.textContent = `${i + 1}. ${q.question}`;
			const answer = document.createElement('p');
			answer.className = 'review__answer';
			const userAns = selectedAnswers[i] !== null ? q.options[selectedAnswers[i]] : '—';
			const correctAns = q.options[q.answerIndex];
			const isCorrect = selectedAnswers[i] === q.answerIndex;
			answer.innerHTML = `Your answer: <strong style="color:${isCorrect ? 'var(--success)' : 'var(--danger)'}">${userAns}</strong> • Correct: <strong>${correctAns}</strong>`;
			item.appendChild(question);
			item.appendChild(answer);
			reviewList.appendChild(item);
		});

		reviewList.style.display = reviewVisible ? 'grid' : 'none';
	}

	function startQuizForCategory(cat) {
		if (!cat) { showCategories(); return; }
		currentCategory = cat;
		reviewVisible = false;
		quizQuestions = [...(questionPools[cat] || [])];
		currentIndex = 0;
		selectedAnswers = new Array(quizQuestions.length).fill(null);
		showLoading(false);
		showQuiz();
		startTimer();
		renderQuestion();
	}

	function restartQuiz() {
		// Restart the current category quiz in-place
		if (currentCategory) {
			startQuizForCategory(currentCategory);
		} else {
			showCategories();
		}
	}

	// Event listeners
	startBtn.addEventListener('click', () => { showCategories(); });
	backToWelcome.addEventListener('click', () => { showWelcome(); });

	// Category selection
	document.querySelectorAll('.cat').forEach((btn) => {
		btn.addEventListener('click', () => {
			const cat = btn.getAttribute('data-category');
			showLoading(true);
			setTimeout(() => {
				startQuizForCategory(cat);
			}, 700);
		});
	});

	prevBtn.addEventListener('click', () => { if (currentIndex > 0) { currentIndex--; renderQuestion(); }});
	nextBtn.addEventListener('click', () => { if (currentIndex < quizQuestions.length - 1) { currentIndex++; renderQuestion(); }});
	submitBtn.addEventListener('click', () => { if (allAnswered()) { showResults(); } else { showHint(); }});
	restartBtn.addEventListener('click', restartQuiz);
	retryBtn.addEventListener('click', () => startQuizForCategory(currentCategory));
	reviewToggle.addEventListener('click', () => { reviewVisible = !reviewVisible; reviewList.style.display = reviewVisible ? 'grid' : 'none'; });

	// Keyboard shortcuts
	document.addEventListener('keydown', (e) => {
		const key = e.key.toLowerCase();
		if (!quizCard.hidden) {
			if (key === 'n') { if (currentIndex < quizQuestions.length - 1) { currentIndex++; renderQuestion(); } }
			if (key === 'p') { if (currentIndex > 0) { currentIndex--; renderQuestion(); } }
			if (['1','2','3','4'].includes(key)) { const idx = Number(key) - 1; selectOption(idx); }
			if (key === 's') { if (allAnswered()) { showResults(); } else { showHint(); } }
			if (key === 'r') { restartQuiz(); }
		}
	});

	// Theme toggle
	function loadTheme() {
		const saved = localStorage.getItem('qq-theme');
		if (saved === 'light') document.body.classList.add('light');
	}
	function toggleTheme() {
		document.body.classList.toggle('light');
		localStorage.setItem('qq-theme', document.body.classList.contains('light') ? 'light' : 'dark');
	}
	themeToggle.addEventListener('click', toggleTheme);

	// Initialize
	loadTheme();
	showWelcome();
})();
