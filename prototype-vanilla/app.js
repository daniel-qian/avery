(function () {
  const data = window.TeamMasterPrototypeData

  const state = {
    scene: 'dashboard',
    focus: null,
    nexusStep: 0,
    isAutoPlaying: false,
    autoTimer: null,
    handoffText: '',
  }

  const app = document.querySelector('#app')
  const dashboardScene = document.querySelector('#dashboard-scene')
  const nexusScene = document.querySelector('#nexus-scene')
  const peopleLayer = document.querySelector('#people-layer')
  const projectLayer = document.querySelector('#project-layer')
  const dashboardEdges = document.querySelector('#dashboard-edges')
  const nexusEdges = document.querySelector('#nexus-edges')
  const nexusFlowLayer = document.querySelector('#nexus-flow-layer')
  const inspectorTitle = document.querySelector('#inspector-title')
  const inspectorCopy = document.querySelector('#inspector-copy')
  const inspectorArtifacts = document.querySelector('#inspector-artifacts')
  const composerInput = document.querySelector('#dashboard-composer-input')
  const playButton = document.querySelector('#play-flow')

  function byId(items, id) {
    return items.find((item) => item.id === id)
  }

  function initials(name) {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  function statusTone(status) {
    if (status === 'blocked') return 'tone-danger'
    if (status === 'at-risk') return 'tone-warning'
    return ''
  }

  const mobilePositions = {
    people: {
      daniel: { x: 50, y: 8 },
      sarah: { x: 35, y: 23 },
      ivy: { x: 65, y: 36 },
      ken: { x: 35, y: 78 },
      marta: { x: 65, y: 90 },
    },
    projects: {
      apollo: { x: 62, y: 48 },
      meridian: { x: 38, y: 58 },
      atlas: { x: 50, y: 68 },
      northstar: { x: 34, y: 84 },
      ledger: { x: 66, y: 76 },
    },
    flow: {
      input: { x: 50, y: 16 },
      thread: { x: 50, y: 29 },
      orchestrator: { x: 50, y: 42 },
      legal: { x: 50, y: 55 },
      context: { x: 50, y: 68 },
      output: { x: 50, y: 81 },
    },
  }

  function setNodePosition(node, position, widthEstimate, mobilePosition) {
    const nextPosition = window.innerWidth <= 860 && mobilePosition ? mobilePosition : position
    if (window.innerWidth <= 860) {
      const sceneWidth = dashboardScene.getBoundingClientRect().width || window.innerWidth
      const half = Math.min(widthEstimate, sceneWidth - 44) / 2
      const rawX = (nextPosition.x / 100) * sceneWidth
      const safeX = Math.max(18 + half, Math.min(sceneWidth - 18 - half, rawX))
      node.style.left = `${safeX}px`
    } else {
      node.style.left = `${nextPosition.x}%`
    }
    node.style.top = `${nextPosition.y}%`
  }

  function nodeCenter(selector, sceneRect) {
    const node = document.querySelector(selector)
    if (!node) return null
    const rect = node.getBoundingClientRect()
    return {
      x: rect.left + rect.width / 2 - sceneRect.left,
      y: rect.top + rect.height / 2 - sceneRect.top,
    }
  }

  function setScene(scene) {
    state.scene = scene
    app.dataset.scene = scene
    dashboardScene.classList.toggle('is-active', scene === 'dashboard')
    nexusScene.classList.toggle('is-active', scene === 'nexus')
    dashboardScene.setAttribute('aria-hidden', scene === 'dashboard' ? 'false' : 'true')
    nexusScene.setAttribute('aria-hidden', scene === 'nexus' ? 'false' : 'true')
    dashboardScene.toggleAttribute('inert', scene !== 'dashboard')
    nexusScene.toggleAttribute('inert', scene !== 'nexus')
    document.querySelectorAll('[data-scene-target]').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.sceneTarget === scene)
    })
    if (scene === 'nexus') {
      renderNexus()
    }
  }

  function setFocus(focus) {
    state.focus = focus
    renderDashboard()
  }

  function isProjectRelated(project) {
    if (!state.focus) return true
    if (state.focus.kind === 'person') return project.ownerId === state.focus.id
    if (state.focus.kind === 'project') return project.id === state.focus.id
    return false
  }

  function isPersonRelated(person) {
    if (!state.focus) return true
    if (state.focus.kind === 'person') return person.id === state.focus.id
    if (state.focus.kind === 'project') {
      const project = byId(data.projects, state.focus.id)
      return project && project.ownerId === person.id
    }
    return false
  }

  function makeNode(tag, className, attrs) {
    const node = document.createElement(tag)
    node.className = className
    Object.entries(attrs || {}).forEach(([key, value]) => {
      if (key === 'text') node.textContent = value
      else node.setAttribute(key, value)
    })
    return node
  }

  function renderPeople() {
    peopleLayer.innerHTML = ''
    data.people.forEach((person) => {
      const node = makeNode('button', `person-node tone-${person.tone}`, {
        type: 'button',
        'data-person-id': person.id,
        'aria-label': `Focus ${person.name}`,
      })
      setNodePosition(node, person.position, 250, mobilePositions.people[person.id])

      const related = isPersonRelated(person)
      const focused = state.focus && state.focus.kind === 'person' && state.focus.id === person.id
      node.classList.toggle('is-muted', Boolean(state.focus && !related))
      node.classList.toggle('is-related', related)
      node.classList.toggle('is-focused', focused)

      node.innerHTML = `
        <span class="avatar" aria-hidden="true">${initials(person.name)}</span>
        <span>
          <h3>${person.name}</h3>
          <p>${person.role}</p>
        </span>
        <span class="person-stats">
          <span>${person.health}% health</span>
          <span>${person.bandwidth}% load</span>
        </span>
      `
      node.addEventListener('click', (event) => {
        event.stopPropagation()
        setFocus(focused ? null : { kind: 'person', id: person.id })
      })
      peopleLayer.appendChild(node)
    })
  }

  function renderProjects() {
    projectLayer.innerHTML = ''
    data.projects.forEach((project) => {
      const owner = byId(data.people, project.ownerId)
      const node = makeNode('button', 'project-card', {
        type: 'button',
        'data-project-id': project.id,
        'aria-label': `Focus ${project.title}`,
      })
      const related = isProjectRelated(project)
      const focused = state.focus && state.focus.kind === 'project' && state.focus.id === project.id
      node.classList.toggle('is-muted', Boolean(state.focus && !related))
      node.classList.toggle('is-related', related)
      node.classList.toggle('is-focused', focused)
      setNodePosition(
        node,
        project.position,
        focused ? 320 : 250,
        mobilePositions.projects[project.id],
      )

      node.innerHTML = `
        <span class="project-status">
          <span class="status-dot ${statusTone(project.status)}"></span>
          ${project.status.replace('-', ' ')}
        </span>
        <h3>${project.title}</h3>
        <p>${project.summary}</p>
        <div class="progress-track" aria-label="${project.progress}% complete">
          <div class="progress-fill" style="width: ${project.progress}%"></div>
        </div>
        <div class="project-meta">
          <span>${project.progress}% complete</span>
          <span>${owner ? owner.name.split(' ')[0] : 'Unassigned'}</span>
        </div>
        <div class="task-list">
          ${project.tasks
            .map(
              (task) =>
                `<span class="task-chip"><strong>${task.title}</strong><span>${task.status}</span></span>`,
            )
            .join('')}
        </div>
      `
      node.addEventListener('click', (event) => {
        event.stopPropagation()
        setFocus(focused ? null : { kind: 'project', id: project.id })
      })
      projectLayer.appendChild(node)
    })
  }

  function drawDashboardEdges() {
    dashboardEdges.innerHTML = ''
    const rect = dashboardScene.getBoundingClientRect()
    data.projects.forEach((project) => {
      const owner = byId(data.people, project.ownerId)
      if (!owner) return
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      const start = nodeCenter(`[data-person-id="${owner.id}"]`, rect)
      const end = nodeCenter(`[data-project-id="${project.id}"]`, rect)
      if (!start || !end) return
      const mid = {
        x: (start.x + end.x) / 2,
        y: Math.min(start.y, end.y) - 36,
      }
      path.setAttribute('d', `M ${start.x} ${start.y} Q ${mid.x} ${mid.y} ${end.x} ${end.y}`)
      path.setAttribute('class', 'edge-path')
      const related =
        !state.focus ||
        (state.focus.kind === 'person' && state.focus.id === owner.id) ||
        (state.focus.kind === 'project' && state.focus.id === project.id)
      path.classList.toggle('is-muted', Boolean(state.focus && !related))
      path.classList.toggle('is-related', Boolean(state.focus && related))
      dashboardEdges.appendChild(path)
    })
  }

  function renderDashboard() {
    const hasFocus = Boolean(state.focus)
    dashboardScene.classList.toggle('has-focus', hasFocus)
    dashboardScene.classList.toggle('has-project-focus', state.focus?.kind === 'project')
    renderPeople()
    renderProjects()
    drawDashboardEdges()
  }

  function drawNexusEdges() {
    nexusEdges.innerHTML = ''
    const rect = nexusScene.getBoundingClientRect()
    data.nexusFlow.forEach((node) => {
      node.edges.forEach((targetId) => {
        const target = byId(data.nexusFlow, targetId)
        if (!target) return
        const sourceIndex = data.nexusFlow.findIndex((item) => item.id === node.id)
        const targetIndex = data.nexusFlow.findIndex((item) => item.id === target.id)
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        const start = nodeCenter(`[data-flow-id="${node.id}"]`, rect)
        const end = nodeCenter(`[data-flow-id="${target.id}"]`, rect)
        if (!start || !end) return
        const mid = {
          x: (start.x + end.x) / 2,
          y: (start.y + end.y) / 2 - 44,
        }
        path.setAttribute('d', `M ${start.x} ${start.y} Q ${mid.x} ${mid.y} ${end.x} ${end.y}`)
        path.setAttribute('class', 'edge-path')
        path.classList.toggle('is-related', sourceIndex < state.nexusStep && targetIndex <= state.nexusStep)
        path.classList.toggle('is-muted', sourceIndex >= state.nexusStep)
        nexusEdges.appendChild(path)
      })
    })
  }

  function renderNexusNodes() {
    nexusFlowLayer.innerHTML = ''
    data.nexusFlow.forEach((flowNode, index) => {
      const node = makeNode('button', 'flow-node', {
        type: 'button',
        'data-flow-id': flowNode.id,
        'aria-label': flowNode.label,
      })
      node.classList.toggle('is-complete', index < state.nexusStep)
      node.classList.toggle('is-active', index === state.nexusStep)
      node.classList.toggle('is-future', index > state.nexusStep)
      setNodePosition(node, flowNode.position, 250, mobilePositions.flow[flowNode.id])
      node.innerHTML = `
        <span class="flow-kind">${flowNode.kind}</span>
        <h3>${flowNode.label}</h3>
        <p>${flowNode.detail}</p>
      `
      node.addEventListener('click', () => {
        state.nexusStep = index
        stopAutoPlay()
        renderNexus()
      })
      nexusFlowLayer.appendChild(node)
    })
  }

  function renderInspector() {
    const current = data.nexusFlow[state.nexusStep]
    inspectorTitle.textContent = current.label
    inspectorCopy.textContent = current.detail

    const artifacts = []
    if (state.nexusStep >= 1) {
      artifacts.push({
        title: 'Thread context',
        copy: state.handoffText || 'Dashboard question and current project focus are attached.',
      })
    }
    if (state.nexusStep >= 3) {
      artifacts.push({
        title: 'Legal read',
        copy: 'Launch is possible only if counsel review is assigned away from Ivy this week.',
      })
    }
    if (state.nexusStep >= 5) {
      artifacts.push({
        title: 'Recommended action',
        copy: 'Delay public launch by three days, create two legal tasks, and keep customer pilot internal.',
      })
      artifacts.push({
        title: 'Task draft',
        copy: 'Assign Swiss counsel review to Daniel, contract check to Marta, customer note to Sarah.',
      })
    }
    inspectorArtifacts.innerHTML = artifacts
      .map(
        (artifact) =>
          `<div class="artifact-card"><strong>${artifact.title}</strong><span>${artifact.copy}</span></div>`,
      )
      .join('')
  }

  function renderNexus() {
    renderNexusNodes()
    drawNexusEdges()
    renderInspector()
  }

  function nextStep() {
    state.nexusStep = Math.min(data.nexusFlow.length - 1, state.nexusStep + 1)
    renderNexus()
    if (state.nexusStep === data.nexusFlow.length - 1) stopAutoPlay()
  }

  function previousStep() {
    state.nexusStep = Math.max(0, state.nexusStep - 1)
    renderNexus()
  }

  function stopAutoPlay() {
    state.isAutoPlaying = false
    if (state.autoTimer) window.clearInterval(state.autoTimer)
    state.autoTimer = null
    playButton.textContent = 'Play'
  }

  function startAutoPlay() {
    state.isAutoPlaying = true
    playButton.textContent = 'Pause'
    if (state.nexusStep === data.nexusFlow.length - 1) {
      state.nexusStep = 0
      renderNexus()
    }
    state.autoTimer = window.setInterval(nextStep, 1450)
  }

  function sendToNexus() {
    state.handoffText = composerInput.value.trim()
    state.nexusStep = 0
    setScene('nexus')
    window.setTimeout(() => {
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) startAutoPlay()
    }, 360)
  }

  function bindEvents() {
    document.querySelectorAll('[data-scene-target]').forEach((button) => {
      button.addEventListener('click', () => {
        stopAutoPlay()
        setScene(button.dataset.sceneTarget)
      })
    })

    document.querySelectorAll('[data-focus-project]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation()
        setFocus({ kind: 'project', id: button.dataset.focusProject })
      })
    })

    document.querySelectorAll('[data-focus-person]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation()
        setFocus({ kind: 'person', id: button.dataset.focusPerson })
      })
    })

    document.querySelectorAll('[data-prompt]').forEach((button) => {
      button.addEventListener('click', () => {
        composerInput.value = button.dataset.prompt
        sendToNexus()
      })
    })

    document.querySelector('#dashboard-send').addEventListener('click', sendToNexus)
    composerInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') sendToNexus()
    })

    document.querySelector('#reset-flow').addEventListener('click', () => {
      stopAutoPlay()
      state.nexusStep = 0
      renderNexus()
    })
    document.querySelector('#prev-step').addEventListener('click', () => {
      stopAutoPlay()
      previousStep()
    })
    document.querySelector('#next-step').addEventListener('click', () => {
      stopAutoPlay()
      nextStep()
    })
    playButton.addEventListener('click', () => {
      if (state.isAutoPlaying) stopAutoPlay()
      else startAutoPlay()
    })

    dashboardScene.addEventListener('click', () => setFocus(null))
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        setFocus(null)
        stopAutoPlay()
      }
    })
    window.addEventListener('resize', () => {
      renderDashboard()
      renderNexus()
    })
  }

  renderDashboard()
  renderNexus()
  bindEvents()
})()
