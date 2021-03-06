import test from 'tape'
import counter from './delayed-counter'

// testing events

test('INCREMENT event', assert => {
  assert.plan(1)
  const state = counter.update(0, 'INCREMENT')
  assert.equal(state.model, 1, 'should increment the model')
})

test('INCREMENT_REQUEST event', assert => {
  assert.plan(2)
  const state = counter.update(0, 'INCREMENT_REQUESTED')
  assert.equal(state.model, 0, 'should not increment the model')
  assert.equal(state.effect, 'SCHEDULE_INCREMENT', 'should return the correct effect')
})

// testing effects

test('DELAYED_INCREMENT effect', { timeout: 2000 }, assert => {
  assert.plan(2)
  const nextEvent$ = counter.run('SCHEDULE_INCREMENT')
  assert.ok(nextEvent$)
  nextEvent$.subscribe(event => {
    assert.equal(event, 'INCREMENT', 'should return an INCREMENT event')
  })
})
