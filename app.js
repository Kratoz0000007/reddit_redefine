/**
 * REDEFINE: CYBER-BRUTALIST REDDIT APPLICATION LOGIC (r/reddit)
 * Full implementation with REDEFINE Track 1: Brutalism
 */

document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'reddit-redefine-state-v1';
  const defaultState = {
    user: { username: 'brutalist_user', joined: ['r/reddit'], karma: 32400 },
    votes: {},
    saved: [],
    posts: [],
    comments: [],
    pollVotes: {},
    notifications: [],
    history: []
  };

  function loadState() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      return stored ? { ...defaultState, ...stored, user: { ...defaultState.user, ...stored.user } } : JSON.parse(JSON.stringify(defaultState));
    } catch {
      return JSON.parse(JSON.stringify(defaultState));
    }
  }

  const state = loadState();
  const persist = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (state.user.joined.includes('r/graphic_design')) {
    state.user.joined = state.user.joined.map(name => name === 'r/graphic_design' ? 'r/reddit' : name);
    persist();
  }
  const recordHistory = value => {
    state.history = [value, ...state.history.filter(item => item !== value)].slice(0, 20);
    persist();
  };

  // --------------------------------------------------------------------------
  // 1. CYBER-BRUTALIST AUDIO SYNTHESIZER (WEB AUDIO API)
  // --------------------------------------------------------------------------
  let audioContext = null;
  let soundEnabled = true;

  function initAudio() {
    if (!audioContext) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioContext = new AudioContext();
      }
    }
  }

  function playCyberTone(freq = 440, type = 'square', duration = 0.06, gainVol = 0.08) {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioContext) return;
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioContext.currentTime);

      gain.gain.setValueAtTime(gainVol, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.start();
      osc.stop(audioContext.currentTime + duration);
    } catch (e) {
      // Audio context might fail in silent autoplay policies until user clicks
    }
  }

  function playClick() {
    playCyberTone(880, 'square', 0.04, 0.05);
  }

  function playThud() {
    playCyberTone(180, 'triangle', 0.09, 0.09);
  }

  function playSuccess() {
    playCyberTone(587.33, 'square', 0.05, 0.06);
    setTimeout(() => playCyberTone(880, 'square', 0.08, 0.06), 60);
  }

  // Audio Toggle Button
  const audioBtn = document.getElementById('audio-toggle-btn');
  const audioStatusText = document.getElementById('audio-status-text');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      if (soundEnabled) {
        audioStatusText.textContent = 'SFX:ON';
        audioBtn.style.color = 'var(--text-primary)';
        playSuccess();
        showToast('CYBER_AUDIO_SYNTH: ACTIVATED');
      } else {
        audioStatusText.textContent = 'SFX:OFF';
        audioBtn.style.color = 'var(--text-muted)';
        showToast('CYBER_AUDIO_SYNTH: MUTED');
      }
    });
  }

  // Generic click sound binding for interactive brutalist elements
  document.querySelectorAll('button, .community-row, .nav-item, .sort-btn, .rule-header').forEach(el => {
    el.addEventListener('click', () => playClick());
  });

  // --------------------------------------------------------------------------
  // 2. TOAST NOTIFICATION SYSTEM
  // --------------------------------------------------------------------------
  const toast = document.getElementById('system-toast');
  const toastMsg = document.getElementById('toast-message');
  let toastTimer = null;

  function showToast(msg) {
    if (!toast || !toastMsg) return;
    toastMsg.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // --------------------------------------------------------------------------
  // 3. VOTING SYSTEM
  // --------------------------------------------------------------------------
  function setupVoteWidget(container, initialScore = 28700, postId = 'featured-post') {
    const upBtn = container.querySelector('.upvote, .comm-vote-btn:first-child');
    const downBtn = container.querySelector('.downvote, .comm-vote-btn:last-child');
    const scoreDisplay = container.querySelector('.vote-score, .comm-pts');

    let currentScore = state.votes[postId]?.score || initialScore;
    let userVote = state.votes[postId]?.value || 0;

    if (userVote === 1) upBtn?.classList.add('active');
    if (userVote === -1) downBtn?.classList.add('active');
    scoreDisplay?.classList.toggle('score-up', userVote === 1);
    scoreDisplay?.classList.toggle('score-down', userVote === -1);

    function formatScore(score) {
      if (score >= 1000) {
        return (score / 1000).toFixed(1) + 'K';
      }
      return score.toString();
    }

    if (upBtn) {
      upBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        playThud();
        if (userVote === 1) {
          userVote = 0;
          currentScore -= 1;
          upBtn.classList.remove('active');
          if (scoreDisplay) scoreDisplay.classList.remove('score-up');
        } else {
          if (userVote === -1) {
            currentScore += 2;
            if (downBtn) downBtn.classList.remove('active');
            if (scoreDisplay) scoreDisplay.classList.remove('score-down');
          } else {
            currentScore += 1;
          }
          userVote = 1;
          upBtn.classList.add('active');
          if (scoreDisplay) scoreDisplay.classList.add('score-up');
        }
        if (scoreDisplay) {
          scoreDisplay.textContent = formatScore(currentScore);
        }
        state.votes[postId] = { value: userVote, score: currentScore };
        persist();
      });
    }

    if (downBtn) {
      downBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        playThud();
        if (userVote === -1) {
          userVote = 0;
          currentScore += 1;
          downBtn.classList.remove('active');
          if (scoreDisplay) scoreDisplay.classList.remove('score-down');
        } else {
          if (userVote === 1) {
            currentScore -= 2;
            if (upBtn) upBtn.classList.remove('active');
            if (scoreDisplay) scoreDisplay.classList.remove('score-up');
          } else {
            currentScore -= 1;
          }
          userVote = -1;
          downBtn.classList.add('active');
          if (scoreDisplay) scoreDisplay.classList.add('score-down');
        }
        if (scoreDisplay) {
          scoreDisplay.textContent = formatScore(currentScore);
        }
        state.votes[postId] = { value: userVote, score: currentScore };
        persist();
      });
    }
  }

  // Initialize main post voting
  const mainVoteWidget = document.getElementById('vote-widget-main');
  if (mainVoteWidget) {
    setupVoteWidget(mainVoteWidget, 28700, 'featured-post');
  }

  // Secondary posts voting
  document.querySelectorAll('.secondary-post .vote-widget').forEach((widget, index) => {
    setupVoteWidget(widget, index === 0 ? 9400 : 3100, `secondary-${index}`);
  });

  // --------------------------------------------------------------------------
  // 7. POSTER LIGHTBOX & TELEMETRY INSPECTOR
  // --------------------------------------------------------------------------
  const lightboxModal = document.getElementById('poster-lightbox-modal');
  const lightboxCanvasSlot = document.getElementById('lightbox-canvas-slot');
  const lightboxTitle = document.getElementById('lightbox-title');
  const telName = document.getElementById('tel-name');
  const closeLightboxBtn = document.getElementById('close-lightbox-btn');
  const downloadSpecBtn = document.getElementById('download-spec-btn');
  const copyHexBtn = document.getElementById('copy-hex-btn');

  const posterCards = document.querySelectorAll('.poster-item-card');
  posterCards.forEach(card => {
    card.addEventListener('click', () => {
      const posterId = card.dataset.posterId;
      const posterTitle = card.dataset.posterTitle;
      const canvasEl = card.querySelector('.poster-canvas');

      if (lightboxCanvasSlot && canvasEl) {
        lightboxCanvasSlot.innerHTML = '';
        const clonedCanvas = canvasEl.cloneNode(true);
        lightboxCanvasSlot.appendChild(clonedCanvas);
      }

      if (lightboxTitle) lightboxTitle.textContent = `INSPECT // ${posterTitle}`;
      if (telName) telName.textContent = `${posterTitle} [ID_#${posterId}]`;

      if (lightboxModal) {
        lightboxModal.classList.add('open');
        playThud();
      }
    });
  });

  if (closeLightboxBtn && lightboxModal) {
    closeLightboxBtn.addEventListener('click', () => {
      lightboxModal.classList.remove('open');
      playClick();
    });

    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        lightboxModal.classList.remove('open');
      }
    });
  }

  if (downloadSpecBtn) {
    downloadSpecBtn.addEventListener('click', () => {
      playSuccess();
      showToast('SPEC_EXPORT: Vector study package dispatched to disk');
    });
  }

  if (copyHexBtn) {
    copyHexBtn.addEventListener('click', () => {
      navigator.clipboard.writeText('#000000, #1C0606, #FF2200, #FFFFFF');
      playSuccess();
      showToast('HEX_COPIED: [#000000, #1C0606, #FF2200, #FFFFFF]');
    });
  }

  // --------------------------------------------------------------------------
  // 8. COMMUNITY RULES ACCORDION
  // --------------------------------------------------------------------------
  const ruleHeaders = document.querySelectorAll('.rule-header');
  ruleHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const parentItem = header.closest('.rule-item');
      if (parentItem) {
        const isOpen = parentItem.classList.contains('open');
        document.querySelectorAll('.rule-item').forEach(item => item.classList.remove('open'));
        if (!isOpen) {
          parentItem.classList.add('open');
        }
      }
    });
  });

  // --------------------------------------------------------------------------
  // 9. JOIN COMMUNITY TOGGLE
  // --------------------------------------------------------------------------
  const joinBtn = document.getElementById('join-community-btn');
  const joinStatusText = document.getElementById('join-status-text');
  let isJoined = state.user.joined.includes('r/reddit');

  function renderJoinState() {
    if (!joinBtn || !joinStatusText) return;
    joinBtn.classList.toggle('btn-primary', !isJoined);
    joinBtn.classList.toggle('btn-secondary', isJoined);
    joinStatusText.textContent = isJoined ? 'LEAVE COMMUNITY [JOINED]' : 'JOIN COMMUNITY';
  }

  renderJoinState();

  if (joinBtn && joinStatusText) {
    joinBtn.addEventListener('click', () => {
      isJoined = !isJoined;
      state.user.joined = isJoined
        ? [...new Set([...state.user.joined, 'r/reddit'])]
        : state.user.joined.filter(name => name !== 'r/reddit');
      persist();
      if (isJoined) {
        joinBtn.classList.remove('btn-primary');
        joinBtn.classList.add('btn-secondary');
        joinStatusText.textContent = 'LEAVE COMMUNITY [JOINED]';
        showToast('COMMUNITY_LINK: r/reddit operator node registered');
        playSuccess();
      } else {
        joinBtn.classList.remove('btn-secondary');
        joinBtn.classList.add('btn-primary');
        joinStatusText.textContent = 'JOIN COMMUNITY';
        showToast('COMMUNITY_LINK: Unsubscribed from transmission channel');
        playThud();
      }
    });
  }

  // --------------------------------------------------------------------------
  // 10. THREADED COMMENTS & REPLY COLLAPSE
  // --------------------------------------------------------------------------
  const toggleCommentsBtn = document.getElementById('toggle-comments-btn');
  const commentsSection = document.getElementById('comments-section');
  const submitCommentBtn = document.getElementById('submit-comment-btn');
  const commentTextarea = document.getElementById('comment-textarea');
  const commentsStream = document.getElementById('comments-stream');

  if (toggleCommentsBtn && commentsSection) {
    toggleCommentsBtn.addEventListener('click', () => {
      const isHidden = commentsSection.style.display === 'none';
      commentsSection.style.display = isHidden ? 'flex' : 'none';
      toggleCommentsBtn.classList.toggle('active', isHidden);
      playClick();
    });
  }

  // Format helper shortcuts
  document.querySelectorAll('.fmt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!commentTextarea) return;
      const fmt = btn.dataset.fmt;
      const start = commentTextarea.selectionStart;
      const end = commentTextarea.selectionEnd;
      const text = commentTextarea.value;
      const selected = text.substring(start, end) || 'text';

      let replacement = selected;
      if (fmt === 'b') replacement = `**${selected}**`;
      if (fmt === 'i') replacement = `*${selected}*`;
      if (fmt === 'code') replacement = `\`${selected}\``;
      if (fmt === 'ascii') replacement = `\n/// [=== ${selected} ===] ///\n`;

      commentTextarea.value = text.substring(0, start) + replacement + text.substring(end);
      commentTextarea.focus();
      playClick();
    });
  });

  // Submit comment
  if (submitCommentBtn && commentTextarea && commentsStream) {
    submitCommentBtn.addEventListener('click', () => {
      const content = commentTextarea.value.trim();
      if (!content) {
        showToast('ERROR: Cannot submit empty commentary buffer');
        playThud();
        return;
      }

      const newCard = document.createElement('div');
      newCard.className = 'comment-card level-0';
      newCard.innerHTML = `
        <div class="comment-meta">
          <span class="comment-author">u/brutalist_user</span>
          <span class="comment-time">just now</span>
          <span class="comment-score">+1 PTS</span>
          <span class="badge-mod">[YOUR_TRANSMISSION]</span>
        </div>
        <div class="comment-text">
          <p>${escapeHtml(content)}</p>
        </div>
        <div class="comment-actions">
          <button class="comm-vote-btn active">▲</button>
          <span class="comm-pts">1</span>
          <button class="comm-vote-btn">▼</button>
          <button class="comm-reply-btn">[REPLY]</button>
          <button class="comm-collapse-btn">[COLLAPSE -]</button>
        </div>
      `;

      commentsStream.insertBefore(newCard, commentsStream.firstChild);
      commentTextarea.value = '';
      const commentId = `comment-${Date.now()}`;
      newCard.dataset.commentId = commentId;
      state.comments.unshift({ id: commentId, postId: 'featured-post', author: state.user.username, content, createdAt: new Date().toISOString(), score: 1 });
      persist();
      setupVoteWidget(newCard, 1, commentId);
      showToast('COMMENT_POSTED: Analysis broadcast to r/reddit');
      playSuccess();
    });
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function restorePersistedComments() {
    if (!commentsStream) return;
    state.comments.slice().reverse().forEach(comment => {
      const card = document.createElement('div');
      card.className = 'comment-card level-0';
      card.dataset.commentId = comment.id;
      card.innerHTML = `
        <div class="comment-meta">
          <span class="comment-author">u/${escapeHtml(comment.author)}</span>
          <span class="comment-time">${new Date(comment.createdAt).toLocaleString()}</span>
          <span class="comment-score">+${comment.score} PTS</span>
          <span class="badge-mod">[YOUR_TRANSMISSION]</span>
        </div>
        <div class="comment-text"><p>${escapeHtml(comment.content)}</p></div>
        <div class="comment-actions">
          <button class="comm-vote-btn active">▲</button>
          <span class="comm-pts">${comment.score}</span>
          <button class="comm-vote-btn">▼</button>
          <button class="comm-reply-btn">[REPLY]</button>
          <button class="comm-collapse-btn">[COLLAPSE -]</button>
        </div>`;
      commentsStream.appendChild(card);
      setupVoteWidget(card, comment.score, comment.id);
    });
  }

  restorePersistedComments();

  // Collapse buttons in comments
  document.addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('comm-collapse-btn')) {
      const card = e.target.closest('.comment-card');
      if (card) {
        const text = card.querySelector('.comment-text');
        const nested = card.querySelectorAll('.comment-card');
        const isCollapsed = card.dataset.collapsed === 'true';

        if (isCollapsed) {
          if (text) text.style.display = 'flex';
          nested.forEach(n => n.style.display = 'flex');
          e.target.textContent = '[COLLAPSE -]';
          card.dataset.collapsed = 'false';
        } else {
          if (text) text.style.display = 'none';
          nested.forEach(n => n.style.display = 'none');
          e.target.textContent = '[EXPAND +]';
          card.dataset.collapsed = 'true';
        }
        playClick();
      }
    }
  });

  // --------------------------------------------------------------------------
  // 11. COMMUNITY POLL VOTING
  // --------------------------------------------------------------------------
  const pollOptions = document.querySelectorAll('.poll-option');
  const pollMsg = document.getElementById('poll-msg');
  let pollVoted = Boolean(state.pollVotes.communityPoll);

  let pollData = [
    { votes: 1442 },
    { votes: 671 },
    { votes: 375 }
  ];

  pollOptions.forEach((opt, idx) => {
    opt.addEventListener('click', () => {
      if (pollVoted) {
        showToast('POLL_ALERT: You have already committed your telemetry vote');
        return;
      }
      pollVoted = true;
      state.pollVotes.communityPoll = idx;
      persist();
      pollData[idx].votes += 1;

      const total = pollData.reduce((acc, cur) => acc + cur.votes, 0);

      pollOptions.forEach((optionEl, i) => {
        const pct = Math.round((pollData[i].votes / total) * 100);
        const bar = optionEl.querySelector('.poll-bar-bg');
        const pctText = optionEl.querySelector('.poll-pct');
        if (bar) bar.style.width = `${pct}%`;
        if (pctText) {
          pctText.textContent = `${pct}% (${pollData[i].votes.toLocaleString()} votes)`;
        }
        if (i === idx) {
          optionEl.style.borderColor = 'var(--accent-red)';
        }
      });

      if (pollMsg) {
        pollMsg.textContent = `VOTED: OPTION [${String.fromCharCode(65 + idx)}] RECORDED`;
        pollMsg.style.color = 'var(--accent-red)';
      }
      showToast(`POLL_RECORDED: Vote logged for Option [${String.fromCharCode(65 + idx)}]`);
      playSuccess();
    });
  });

  // --------------------------------------------------------------------------
  // 12. CREATE POST MODAL & SUBMISSION
  // --------------------------------------------------------------------------
  const createModal = document.getElementById('create-post-modal');
  const openCreateBtn = document.getElementById('open-create-modal-btn');
  const closeCreateBtn = document.getElementById('close-create-modal-btn');
  const cancelCreateBtn = document.getElementById('cancel-create-btn');
  const publishPostBtn = document.getElementById('publish-post-btn');
  const postTitleInput = document.getElementById('new-post-title');
  const postBodyInput = document.getElementById('new-post-body');
  const postFlairSelect = document.getElementById('new-post-flair');

  if (openCreateBtn && createModal) {
    openCreateBtn.addEventListener('click', () => {
      createModal.classList.add('open');
      playThud();
    });
  }

  function closeCreate() {
    if (createModal) createModal.classList.remove('open');
    playClick();
  }

  if (closeCreateBtn) closeCreateBtn.addEventListener('click', closeCreate);
  if (cancelCreateBtn) cancelCreateBtn.addEventListener('click', closeCreate);

  // Format pills
  const formatPills = document.querySelectorAll('.format-pill');
  formatPills.forEach(pill => {
    pill.addEventListener('click', () => {
      formatPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      playClick();
    });
  });

  if (publishPostBtn && postTitleInput && postBodyInput) {
    publishPostBtn.addEventListener('click', () => {
      const title = postTitleInput.value.trim();
      const body = postBodyInput.value.trim();
      const flair = postFlairSelect ? postFlairSelect.value : '1b_CYBER_BRUTALISM';

      if (!title) {
        showToast('ERROR: Post title required');
        playThud();
        return;
      }

      const feed = document.getElementById('center-feed');
      const featuredCard = document.getElementById('featured-post-card');

      if (feed && featuredCard) {
        const newPost = document.createElement('article');
        newPost.className = 'post-card secondary-post';
        newPost.innerHTML = `
          <div class="post-header-bar">
            <div class="post-origin-meta">
              <span class="post-subreddit-badge">r/reddit</span>
              <span class="divider-slash">///</span>
              <span class="post-author">Posted by <strong>u/brutalist_user</strong> [OP]</span>
              <span class="post-timestamp">just now</span>
              <span class="post-flair-badge">[${flair}]</span>
            </div>
            <span class="upvote-ratio">100% UPVOTED</span>
          </div>
          <div class="post-title-section">
            <h2 class="post-secondary-title">${escapeHtml(title)}</h2>
          </div>
          <div class="post-body-text">
            <p>${escapeHtml(body || 'No transmission body provided.')}</p>
          </div>
          <div class="post-footer-bar">
            <div class="vote-widget">
              <button class="vote-btn active upvote">▲</button>
              <span class="vote-score score-up">1</span>
              <button class="vote-btn downvote">▼</button>
            </div>
            <button class="post-action-btn"><span class="btn-glyph">[💬]</span> 0_REPLIES</button>
            <button class="post-action-btn"><span class="btn-glyph">[⎘]</span> SHARE</button>
          </div>
        `;

        feed.insertBefore(newPost, featuredCard);
        const postId = `post-${Date.now()}`;
        newPost.dataset.postId = postId;
        state.posts.unshift({ id: postId, title, body, flair, community: 'r/reddit', author: state.user.username, createdAt: new Date().toISOString(), score: 1 });
        persist();
        setupVoteWidget(newPost.querySelector('.vote-widget'), 1, postId);
        postTitleInput.value = '';
        postBodyInput.value = '';
        closeCreate();
        showToast('BROADCAST_SUCCESS: New transmission submitted to feed');
        playSuccess();
      }
    });
  }

  function restorePersistedPosts() {
    const feed = document.getElementById('center-feed');
    const featuredCard = document.getElementById('featured-post-card');
    if (!feed || !featuredCard) return;
    state.posts.slice().reverse().forEach(post => {
      const card = document.createElement('article');
      card.className = 'post-card secondary-post post-persisted';
      card.dataset.postId = post.id;
      card.innerHTML = `
        <div class="post-header-bar"><div class="post-origin-meta"><span class="post-subreddit-badge">${escapeHtml(post.community)}</span><span class="divider-slash">///</span><span class="post-author">Posted by <strong>u/${escapeHtml(post.author)}</strong> [OP]</span><span class="post-timestamp">${new Date(post.createdAt).toLocaleString()}</span><span class="post-flair-badge">[${escapeHtml(post.flair)}]</span></div><span class="upvote-ratio">LOCAL_TRANSMISSION</span></div>
        <div class="post-title-section"><h2 class="post-secondary-title">${escapeHtml(post.title)}</h2></div>
        <div class="post-body-text"><p>${escapeHtml(post.body || 'No transmission body provided.')}</p></div>
        <div class="post-footer-bar"><div class="vote-widget"><button class="vote-btn upvote">▲</button><span class="vote-score">${post.score}</span><button class="vote-btn downvote">▼</button></div><button class="post-action-btn"><span class="btn-glyph">[💬]</span>0_REPLIES</button><button class="post-action-btn"><span class="btn-glyph">[⎘]</span>SHARE</button></div>`;
      feed.insertBefore(card, featuredCard);
      setupVoteWidget(card.querySelector('.vote-widget'), post.score, post.id);
    });
  }

  restorePersistedPosts();

  // --------------------------------------------------------------------------
  // 13. NOTIFICATIONS DROPDOWN & SEARCH SHORTCUT
  // --------------------------------------------------------------------------
  const notifBtn = document.getElementById('notif-btn');
  const notifDropdown = document.getElementById('notif-dropdown');
  if (notifBtn && notifDropdown) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle('show');
      playClick();
    });

    document.addEventListener('click', (e) => {
      if (!notifDropdown.contains(e.target) && e.target !== notifBtn) {
        notifDropdown.classList.remove('show');
      }
    });
  }

  // Search shortcut Ctrl+K
  const searchInput = document.getElementById('main-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchInput.classList.toggle('search-active', searchInput.value.trim().length > 0);
    });
    searchInput.addEventListener('focus', () => searchInput.closest('.search-container')?.classList.add('command-focus'));
    searchInput.addEventListener('blur', () => searchInput.closest('.search-container')?.classList.remove('command-focus'));
  }

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (searchInput) {
        searchInput.focus();
        showToast('SEARCH_INPUT: FOCUSED');
      }
    }
    if (e.key === 'Escape') {
      if (lightboxModal && lightboxModal.classList.contains('open')) {
        lightboxModal.classList.remove('open');
      }
      if (createModal && createModal.classList.contains('open')) {
        createModal.classList.remove('open');
      }
    }
  });

  // Sort buttons handler
  const sortBtns = document.querySelectorAll('.sort-btn');
  sortBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sortBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      showToast(`FEED_ORDER: Switched to [${btn.dataset.sort.toUpperCase()}]`);
      playThud();
    });
  });

  // Nav links switcher
  const navItems = document.querySelectorAll('.sidebar-nav-list .nav-item');
  const mobileNavToggle = document.getElementById('mobile-nav-toggle');
  const leftSidebar = document.getElementById('left-sidebar');

  mobileNavToggle?.addEventListener('click', () => {
    const isOpen = leftSidebar?.classList.toggle('mobile-open');
    mobileNavToggle.setAttribute('aria-expanded', String(Boolean(isOpen)));
    mobileNavToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  });

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      leftSidebar?.classList.remove('mobile-open');
      mobileNavToggle?.setAttribute('aria-expanded', 'false');
      window.location.hash = `/${item.dataset.view}`;
      document.body.classList.remove('signal-transition');
      void document.body.offsetWidth;
      document.body.classList.add('signal-transition');
      window.setTimeout(() => document.body.classList.remove('signal-transition'), 180);
      showToast(`NAV: Loaded channel ${item.dataset.view.toUpperCase()}`);
    });
  });

  // Ping Mods Button
  const msgModsBtn = document.getElementById('msg-mods-btn');
  if (msgModsBtn) {
    msgModsBtn.addEventListener('click', () => {
      showToast('MOD_PING: Transmission sent to u/karl_gerstner_fan');
      playSuccess();
    });
  }

  // Share and Save buttons
  const shareBtn = document.getElementById('share-post-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href);
      showToast('LINK_COPIED: Thread URL copied to clipboard');
      playSuccess();
    });
  }

  const saveBtn = document.getElementById('save-post-btn');
  if (saveBtn) {
    saveBtn.classList.toggle('active', state.saved.includes('featured-post'));
    saveBtn.addEventListener('click', () => {
      saveBtn.classList.toggle('active');
      state.saved = saveBtn.classList.contains('active')
        ? [...new Set([...state.saved, 'featured-post'])]
        : state.saved.filter(id => id !== 'featured-post');
      persist();
      showToast(saveBtn.classList.contains('active') ? 'PERSISTENCE: Post saved to memory cache' : 'PERSISTENCE: Post removed from saved cache');
      playClick();
    });
  }

  // Featured post options
  document.querySelectorAll('.post-options-wrap').forEach(options => {
    const menuButton = options.querySelector('.header-menu-btn');
    const menu = options.querySelector('.post-options-menu');
    const removeButton = options.querySelector('.remove-post-btn');

    menuButton?.addEventListener('click', event => {
      event.stopPropagation();
      const isOpen = menu?.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(Boolean(isOpen)));
    });

    removeButton?.addEventListener('click', () => {
      const post = options.closest('.post-card');
      if (!post || !window.confirm('Remove this post from the feed?')) return;
      post.classList.add('post-removing');
      window.setTimeout(() => {
        post.remove();
        showToast('POST_REMOVED: Transmission deleted from local feed');
      }, 180);
    });
    if (removeButton) removeButton.dataset.bound = 'true';
  });

  document.addEventListener('click', event => {
    const dynamicRemove = event.target.closest?.('.remove-post-btn:not([data-bound])');
    if (dynamicRemove) {
      const post = dynamicRemove.closest('.post-card');
      if (post && window.confirm('Remove this post from the feed?')) {
        post.classList.add('post-removing');
        window.setTimeout(() => {
          post.remove();
          showToast('POST_REMOVED: Transmission deleted from local feed');
        }, 180);
      }
      return;
    }
    document.querySelectorAll('.post-options-menu.open').forEach(menu => {
      if (!menu.parentElement.contains(event.target)) {
        menu.classList.remove('open');
        menu.parentElement.querySelector('.header-menu-btn')?.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Client-side Reddit pages share the existing shell and preserve home markup.
  const centerFeed = document.getElementById('center-feed');
  const homeFeedMarkup = centerFeed ? centerFeed.innerHTML : '';
  const homeTitle = document.title;
  const routeCopy = {
    popular: ['POPULAR_GLOBAL', 'The network-wide signal with the highest velocity.'],
    news: ['DESIGN_NEWS', 'Fresh reports, launches, tools, and cultural transmissions.'],
    explore: ['EXPLORE_INDEX', 'Discover communities and channels beyond your current feed.'],
    archive: ['SPEC_ARCHIVE', 'Saved technical studies, guides, and long-form transmissions.'],
    saved: ['SAVED_TRANSMISSIONS', 'Your retained posts and reference material.'],
    history: ['ACTIVITY_LOG', 'Recently visited threads and interaction history.']
    , community: ['START_A_COMMUNITY', 'Open a new community channel and establish its first signal.']
  };

  function routePost(title, community, author, score, replies, flair) {
    return `<article class="post-card route-post"><div class="post-header-bar"><div class="post-origin-meta"><span class="post-subreddit-badge">${community}</span><span class="divider-slash">///</span><span class="post-author">USER://${author}</span><span class="post-timestamp">14M AGO</span><span class="post-flair-badge">[${flair || 'DISCUSSION'}]</span></div><div class="post-header-actions"><span class="upvote-ratio">LIVE_SIGNAL</span><div class="post-options-wrap"><button class="header-menu-btn" title="Post Options" aria-label="Open post options" aria-expanded="false">•••</button><div class="post-options-menu" role="menu"><button class="remove-post-btn" type="button" role="menuitem">[X] REMOVE_POST</button></div></div></div></div><div class="post-title-section"><h2 class="post-secondary-title glitch-text" data-text="${title}">${title}</h2><div class="post-sub-specs"><span>POST_ID://48291</span><span>STATUS://SYNCED</span></div></div><div class="post-body-text"><p>Transmission received from the community network. Read the full thread, inspect the responses, and add your own signal to the discussion.</p></div><div class="post-footer-bar"><div class="vote-widget"><button class="vote-btn upvote" aria-label="Upvote">▲</button><span class="vote-score">${score}</span><button class="vote-btn downvote" aria-label="Downvote">▼</button></div><button class="post-action-btn route-detail-btn"><span class="btn-glyph">[💬]</span>${replies}_REPLIES</button><button class="post-action-btn"><span class="btn-glyph">[⎘]</span>SHARE</button></div></article>`;
  }

  function renderRoute(route) {
    if (!centerFeed) return;
    const cleanRoute = route.replace(/^\//, '').split('?')[0] || 'home';
    if (cleanRoute === 'home') {
      if (centerFeed.dataset.routeActive === 'true') {
        window.location.reload();
        return;
      }
      centerFeed.innerHTML = homeFeedMarkup;
      document.title = homeTitle;
    } else if (cleanRoute.startsWith('search/')) {
      const term = decodeURIComponent(cleanRoute.slice(7).replace(/-/g, ' '));
      centerFeed.innerHTML = `<div class="route-heading"><span class="route-kicker">/// SEARCH_RESULTS</span><h1>${term || 'NETWORK'}</h1><p>[ 1284 RESULTS_FOUND ] // QUERY_SYNCHRONIZED</p></div>${routePost(`Results for ${term || 'network'}`, 'r/search', 'index_bot', '12.8K', '284', 'SEARCH_RESULT')}${routePost('Related transmissions detected in the archive', 'r/reddit', 'signal_reader', '8.4K', '119', 'MATCHED')}`;
      document.title = `Search: ${term} // Reddit://net`;
    } else if (cleanRoute.startsWith('r/')) {
      centerFeed.innerHTML = `<div class="route-heading"><span class="route-kicker">/// COMMUNITY_CHANNEL</span><h1>${cleanRoute}</h1><p>235K MEMBERS // 4.6K ONLINE // STATUS://CONNECTED</p><button class="brutalist-btn btn-primary route-join-btn">[+] JOIN_COMMUNITY</button></div>${routePost('Pinned transmission: establish the visual language', cleanRoute, 'arch_void', '28.7K', '342', 'PINNED')}${routePost('Critique thread // new responses available', cleanRoute, 'grid_system_mod', '9.4K', '89', 'CRITIQUE')}`;
      document.title = `${cleanRoute} // Reddit://net`;
    } else {
      const copy = routeCopy[cleanRoute] || ['SIGNAL_NOT_FOUND', 'The requested channel is not available in this node.'];
      centerFeed.innerHTML = `<div class="route-heading"><span class="route-kicker">/// REDDIT://NET // ${cleanRoute.toUpperCase()}</span><h1>${copy[0]}</h1><p>${copy[1]}</p><div class="route-metrics"><span>ONLINE://42.1K</span><span>LATENCY://24MS</span><span>SIGNAL://98%</span></div></div>${routePost(`${copy[0]} // latest community transmission`, 'r/reddit', 'network_operator', '18.2K', '342', cleanRoute.toUpperCase())}${routePost('New data received from a related community', 'r/brutalism', 'archive_node', '6.8K', '77', 'NEW_DATA')}`;
      document.title = `${copy[0]} // Reddit://net`;
    }
    centerFeed.dataset.routeActive = 'true';
    centerFeed.classList.remove('route-signal');
    void centerFeed.offsetWidth;
    centerFeed.classList.add('route-signal');
    centerFeed.querySelectorAll('.vote-widget').forEach((widget, index) => setupVoteWidget(widget, index ? 6800 : 18200));
    centerFeed.querySelectorAll('.route-detail-btn, .route-post .post-secondary-title').forEach(element => element.addEventListener('click', () => { window.location.hash = '/post/48291'; }));
    centerFeed.querySelector('.route-join-btn')?.addEventListener('click', () => showToast('COMMUNITY_LINK: channel joined'));
  }

  function syncRoute() {
    const route = window.location.hash.slice(1) || '/home';
    const baseRoute = route.replace(/^\//, '').split('/')[0];
    navItems.forEach(item => item.classList.toggle('active', item.dataset.view === baseRoute));
    renderRoute(route.startsWith('/post/') ? 'r/reddit' : route);
    if (route.startsWith('/post/')) document.title = 'POST_ID://48291 // Reddit://net';
  }

  window.addEventListener('hashchange', syncRoute);
  if (window.location.hash && window.location.hash !== '#/home') syncRoute();
  document.querySelectorAll('.community-row').forEach(row => row.addEventListener('click', () => {
    const name = row.querySelector('.comm-title')?.textContent.trim();
    if (name) window.location.hash = `/${name}`;
  }));

  if (searchInput) searchInput.addEventListener('keydown', event => {
    if (event.key === 'Enter' && searchInput.value.trim()) window.location.hash = `/search/${encodeURIComponent(searchInput.value.trim().toLowerCase().replace(/\s+/g, '-'))}`;
  });

  // Controlled visual signal bursts for decorative system text only.
  const glitchTargets = Array.from(document.querySelectorAll('.glitch-text, .section-title-bar, .system-build-tag, .status-label, .notif-badge, .post-secondary-title, .card-title-text'));
  const bootScreen = document.getElementById('boot-screen');
  const bootLog = document.getElementById('boot-log');
  const bootMessages = [
    '> AUTHENTICATING USER...',
    '> LOADING COMMUNITY DATA...',
    '> CONNECTION ESTABLISHED_'
  ];

  function triggerGlitch(target) {
    if (!target || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const glitchTypes = ['glitch-type-rgb', 'glitch-type-slice', 'glitch-type-jitter', 'glitch-type-drop'];
    target.classList.remove(...glitchTypes);
    target.classList.add(glitchTypes[Math.floor(Math.random() * glitchTypes.length)]);
    target.classList.remove('glitch-burst');
    void target.offsetWidth;
    target.classList.add('glitch-burst');
    window.setTimeout(() => target.classList.remove('glitch-burst', ...glitchTypes), 280);
  }

  function scheduleGlitch() {
    if (glitchTargets.length) {
      triggerGlitch(glitchTargets[Math.floor(Math.random() * glitchTargets.length)]);
    }
    window.setTimeout(scheduleGlitch, 2000 + Math.random() * 3000);
  }

  if (bootScreen) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || sessionStorage.getItem('reddit-net-booted')) {
      bootScreen.remove();
    } else {
      sessionStorage.setItem('reddit-net-booted', 'true');
      bootMessages.forEach((message, index) => {
        window.setTimeout(() => {
          if (bootLog) bootLog.textContent = message;
        }, 180 + index * 180);
      });
      window.setTimeout(() => bootScreen.classList.add('boot-complete'), 760);
      window.setTimeout(() => bootScreen.remove(), 980);
    }
  }

  window.setTimeout(scheduleGlitch, 3200);
});
