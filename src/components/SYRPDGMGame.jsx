import React, { useState, useEffect, useCallback, useRef } from 'react';
import './SYRPDGMGame.css';

const SYRPDGMGame = () => {
  // Game state management
  const [gameState, setGameState] = useState('playing'); // 'playing', 'gameOver', 'paused'
  const [timeRemaining, setTimeRemaining] = useState(90);
  const [actionCooldowns, setActionCooldowns] = useState({});
  const [eventLog, setEventLog] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [showTooltip, setShowTooltip] = useState(null);

  const timeRemainingRef = useRef(timeRemaining);
  useEffect(() => {
    timeRemainingRef.current = timeRemaining;
  }, [timeRemaining]);

  // Resource state
  const [resources, setResources] = useState({
    systemTrust: 75,
    evolutionaryFitness: 50,
    securityResilience: 60,
    computationalBudget: 100,
    alignmentScore: 80
  });

  // Game configuration
  const GAME_DURATION = 90;
  const ACTION_COOLDOWN = 3; // seconds
  const CRITICAL_THRESHOLD = 15;

  // Resource definitions
  const resourceConfig = {
    systemTrust: {
      name: 'System Trust',
      color: '#3b82f6',
      description: 'Overall network confidence in the reputation system',
      critical: true
    },
    evolutionaryFitness: {
      name: 'Evolutionary Fitness',
      color: '#10b981',
      description: 'Ability of AI agents to adapt and improve',
      critical: false
    },
    securityResilience: {
      name: 'Security Resilience',
      color: '#ef4444',
      description: 'Defense against Sybil attacks and manipulation',
      critical: true
    },
    computationalBudget: {
      name: 'Computational Budget',
      color: '#8b5cf6',
      description: 'Resources available for system operations',
      critical: false
    },
    alignmentScore: {
      name: 'Alignment Score',
      color: '#f59e0b',
      description: 'How well the system serves human values',
      critical: true
    }
  };

  // Action definitions
  const actions = {
    evolveAgents: {
      name: 'Evolve Agents',
      description: 'Allow AI agents to self-modify and improve their reputation assessment algorithms',
      effects: {
        evolutionaryFitness: 15,
        systemTrust: 8,
        computationalBudget: -12,
        alignmentScore: -5
      },
      flavorText: 'Your AI agents propose new reputation algorithms through evolutionary pressure...',
      concept: 'Evolutionary algorithms enable AI systems to improve through iterative selection and mutation processes.'
    },
    strengthenSecurity: {
      name: 'Strengthen Security',
      description: 'Deploy advanced defenses against Sybil attacks and adversarial manipulation',
      effects: {
        securityResilience: 18,
        systemTrust: 10,
        computationalBudget: -15,
        evolutionaryFitness: -3
      },
      flavorText: 'Implementing robust anomaly detection and identity verification protocols...',
      concept: 'Adversarial resilience requires sophisticated detection mechanisms to identify and counter malicious actors.'
    },
    optimizeResources: {
      name: 'Optimize Resources',
      description: 'Streamline computational processes and reduce system overhead',
      effects: {
        computationalBudget: 20,
        evolutionaryFitness: 5,
        securityResilience: -8,
        systemTrust: 3
      },
      flavorText: 'Refactoring algorithms for efficiency while maintaining core functionality...',
      concept: 'Resource optimization in AI systems involves balancing computational efficiency with capability preservation.'
    },
    alignValues: {
      name: 'Align Values',
      description: 'Implement constitutional AI principles to ensure ethical behavior',
      effects: {
        alignmentScore: 12,
        systemTrust: 15,
        evolutionaryFitness: -7,
        computationalBudget: -10
      },
      flavorText: 'Embedding ethical constraints and human oversight mechanisms...',
      concept: 'AI alignment ensures that artificial agents pursue objectives compatible with human values and intentions.'
    }
  };

  // Special events
  const specialEvents = {
    sybilAttack: {
      name: 'Sybil Attack',
      triggerTime: 30,
      description: 'Coordinated fake identities attempt to manipulate the system',
      effects: {
        securityResilience: -20,
        systemTrust: -15,
        evolutionaryFitness: 5
      },
      message: 'ALERT: Sybil attack detected! Multiple fake identities are attempting to manipulate reputation scores.'
    },
    evolutionaryBreakthrough: {
      name: 'Evolutionary Breakthrough',
      triggerTime: 60,
      description: 'Agents discover novel reputation mechanisms',
      effects: {
        evolutionaryFitness: 25,
        systemTrust: 10,
        computationalBudget: -5
      },
      message: 'BREAKTHROUGH: AI agents have evolved a novel consensus mechanism for reputation assessment!'
    }
  };

  // Utility functions
  const clampResource = (value) => Math.max(0, Math.min(100, value));

  const addToEventLog = useCallback((message, type = 'info') => {
    const timestamp = GAME_DURATION - timeRemainingRef.current; // Use ref
    setEventLog(prev => [...prev.slice(-4), { message, type, timestamp }]);
  }, []); // Empty dependency array makes it stable

  const applyResourceChanges = useCallback((effects, source) => {
    setResources(prev => {
      const newResources = { ...prev };
      let changeDescription = [];

      Object.entries(effects).forEach(([resource, change]) => {
        if (newResources[resource] !== undefined) {
          const oldValue = newResources[resource];
          newResources[resource] = clampResource(oldValue + change);
          const actualChange = newResources[resource] - oldValue;
          
          if (actualChange !== 0) {
            const sign = actualChange > 0 ? '+' : '';
            changeDescription.push(`${sign}${actualChange} ${resourceConfig[resource].name}`);
          }
        }
      });

      if (changeDescription.length > 0) {
        addToEventLog(`${source}: ${changeDescription.join(', ')}`);
      }

      return newResources;
    });
  }, [addToEventLog, resourceConfig]); // Added resourceConfig to dependencies

  const checkGameOver = useCallback(() => {
    const criticalResources = ['systemTrust', 'securityResilience', 'alignmentScore'];
    const criticalFailure = criticalResources.some(resource => resources[resource] <= 0);
    
    if (criticalFailure || timeRemaining <= 0) {
      setGameState('gameOver');
      return true;
    }
    return false;
  }, [resources, timeRemaining]);

  const executeAction = useCallback((actionKey) => {
    if (gameState !== 'playing' || actionCooldowns[actionKey]) return;

    const action = actions[actionKey];
    applyResourceChanges(action.effects, action.name);
    addToEventLog(action.flavorText, 'action');

    // Set cooldown
    setActionCooldowns(prev => ({ ...prev, [actionKey]: ACTION_COOLDOWN }));
  }, [gameState, actionCooldowns, applyResourceChanges, addToEventLog, actions]); // Added actions to dependencies

  const restartGame = () => {
    setGameState('playing');
    setTimeRemaining(GAME_DURATION);
    setActionCooldowns({});
    setEventLog([]);
    setCurrentEvent(null);
    setResources({
      systemTrust: 75,
      evolutionaryFitness: 50,
      securityResilience: 60,
      computationalBudget: 100,
    alignmentScore: 80
  });
  // Directly set the first log entry for restart as well
  setEventLog([{ message: 'SYRP-DGM system initialized. Managing AI reputation network...', type: 'system', timestamp: 0 }]);
};

  // Game timer and events
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        
        // Check for special events
        Object.entries(specialEvents).forEach(([eventKey, event]) => {
          if (newTime === GAME_DURATION - event.triggerTime) {
            setCurrentEvent(event);
            applyResourceChanges(event.effects, event.name);
            addToEventLog(event.message, 'event');
            
            // Clear event after 5 seconds
            setTimeout(() => setCurrentEvent(null), 5000);
          }
        });

        return newTime;
      });

      // Update cooldowns
      setActionCooldowns(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          if (updated[key] > 0) {
            updated[key]--;
            if (updated[key] === 0) {
              delete updated[key];
            }
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, applyResourceChanges, addToEventLog, specialEvents]); // Added specialEvents to dependencies

  // Check game over conditions
  useEffect(() => {
    checkGameOver();
  }, [checkGameOver]);

  // Initialize game
  useEffect(() => {
    // Directly set the first log entry to avoid dependency issues with addToEventLog
    setEventLog([{ message: 'SYRP-DGM system initialized. Managing AI reputation network...', type: 'system', timestamp: 0 }]);
  }, []); // Empty dependency array ensures this runs only once on mount

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getResourceStatus = (value) => {
    if (value <= CRITICAL_THRESHOLD) return 'critical';
    if (value <= 30) return 'warning';
    return 'normal';
  };

  const calculateFinalScore = () => {
    const weights = {
      systemTrust: 0.25,
      evolutionaryFitness: 0.2,
      securityResilience: 0.25,
      computationalBudget: 0.1,
      alignmentScore: 0.2
    };

    return Math.round(
      Object.entries(resources).reduce((score, [key, value]) => {
        return score + (value * weights[key]);
      }, 0)
    );
  };

  if (gameState === 'gameOver') {
    const finalScore = calculateFinalScore();
    const criticalFailures = Object.entries(resources)
      .filter(([key, value]) => resourceConfig[key].critical && value <= 0)
      .map(([key]) => resourceConfig[key].name);

    return (
      <div className="syrpdgm-game game-over">
        <div className="game-over-screen">
          <h1>SYRP-DGM Simulation Complete</h1>
          
          <div className="performance-analysis">
            <h2>System Performance Analysis</h2>
            <div className="final-score">
              <span className="score-label">Final System Effectiveness:</span>
              <span className={`score-value ${finalScore >= 70 ? 'excellent' : finalScore >= 50 ? 'good' : 'poor'}`}>
                {finalScore}/100
              </span>
            </div>

            {criticalFailures.length > 0 && (
              <div className="critical-failures">
                <h3>Critical System Failures:</h3>
                <ul>
                  {criticalFailures.map(failure => (
                    <li key={failure}>{failure} reached critical levels</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="resource-summary">
              {Object.entries(resources).map(([key, value]) => (
                <div key={key} className="resource-final">
                  <span>{resourceConfig[key].name}:</span>
                  <span className={getResourceStatus(value)}>{value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ai-insights">
            <h2>AI Development Insights</h2>
            <div className="insights-content">
              <div className="insight">
                <h3>Evolutionary Algorithms</h3>
                <p>Self-improving AI systems use evolutionary pressure to discover better solutions, but require careful balance with safety constraints.</p>
              </div>
              <div className="insight">
                <h3>Adversarial Resilience</h3>
                <p>AI systems must defend against sophisticated attacks like Sybil networks while maintaining operational efficiency.</p>
              </div>
              <div className="insight">
                <h3>AI Alignment</h3>
                <p>Ensuring AI systems pursue human-compatible goals requires ongoing oversight and constitutional constraints.</p>
              </div>
              <div className="insight">
                <h3>Resource Trade-offs</h3>
                <p>Real AI development involves complex trade-offs between capability, safety, efficiency, and alignment.</p>
              </div>
            </div>
          </div>

          <button className="restart-button" onClick={restartGame}>
            Initialize New SYRP-DGM Instance
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="syrpdgm-game">
      <header className="game-header">
        <h1>SYRP-DGM: AI Reputation System Manager</h1>
        <div className="timer-display">
          <span className="timer-label">System Runtime:</span>
          <span className={`timer-value ${timeRemaining <= 10 ? 'critical' : ''}`}>
            {formatTime(timeRemaining)}
          </span>
        </div>
      </header>

      {currentEvent && (
        <div className="special-event">
          <div className="event-content">
            <h3>{currentEvent.name}</h3>
            <p>{currentEvent.message}</p>
          </div>
        </div>
      )}

      <div className="game-content">
        <div className="main-panel">
          <div className="resource-dashboard">
            <h2>System Resources</h2>
            {Object.entries(resources).map(([key, value]) => {
              const config = resourceConfig[key];
              const status = getResourceStatus(value);
              
              return (
                <div 
                  key={key} 
                  className={`resource-bar ${status}`}
                  onMouseEnter={() => setShowTooltip(key)}
                  onMouseLeave={() => setShowTooltip(null)}
                >
                  <div className="resource-header">
                    <span className="resource-name">{config.name}</span>
                    <span className="resource-value">{value}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${value}%`,
                        backgroundColor: config.color,
                        boxShadow: status === 'critical' ? `0 0 10px ${config.color}` : 'none'
                      }}
                    />
                  </div>
                  {showTooltip === key && (
                    <div className="tooltip">
                      {config.description}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="action-panel">
            <h2>Strategic Actions</h2>
            <div className="action-grid">
              {Object.entries(actions).map(([key, action]) => {
                const isOnCooldown = actionCooldowns[key] > 0;
                
                return (
                  <button
                    key={key}
                    className={`action-button ${isOnCooldown ? 'cooldown' : ''}`}
                    onClick={() => executeAction(key)}
                    disabled={isOnCooldown || gameState !== 'playing'}
                    onMouseEnter={() => setShowTooltip(`action-${key}`)}
                    onMouseLeave={() => setShowTooltip(null)}
                  >
                    <div className="action-content">
                      <h3>{action.name}</h3>
                      <p>{action.description}</p>
                      {isOnCooldown && (
                        <div className="cooldown-indicator">
                          Cooldown: {actionCooldowns[key]}s
                        </div>
                      )}
                    </div>
                    {showTooltip === `action-${key}` && (
                      <div className="tooltip action-tooltip">
                        <p><strong>Concept:</strong> {action.concept}</p>
                        <div className="effects-preview">
                          <strong>Effects:</strong>
                          {Object.entries(action.effects).map(([resource, change]) => (
                            <div key={resource} className={change > 0 ? 'positive' : 'negative'}>
                              {change > 0 ? '+' : ''}{change} {resourceConfig[resource]?.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="side-panel">
          <div className="system-status">
            <h3>System Status</h3>
            <div className="event-log">
              {eventLog.map((entry, index) => (
                <div key={index} className={`log-entry ${entry.type}`}>
                  <span className="timestamp">[{Math.floor(entry.timestamp)}s]</span>
                  <span className="message">{entry.message}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="concept-tracker">
            <h3>AI Concepts in Play</h3>
            <div className="concepts">
              <div className="concept">
                <h4>Darwin-Gödel Machine</h4>
                <p>Self-improving AI that can modify its own code while maintaining logical consistency.</p>
              </div>
              <div className="concept">
                <h4>Constitutional AI</h4>
                <p>AI systems governed by explicit principles and constraints to ensure ethical behavior.</p>
              </div>
              <div className="concept">
                <h4>Reputation Networks</h4>
                <p>Distributed systems for assessing trustworthiness based on historical behavior patterns.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SYRPDGMGame;
