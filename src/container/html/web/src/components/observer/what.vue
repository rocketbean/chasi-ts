<template>
  <div>
    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-3">
          <span>
            <hook id="observer" />
            {{ observer.label }}
          </span>
        </div>
        <small>
          <span class="subtitle">{{ observer.sublabel }}</span>
        </small>
      </div>
      <span class="sub-text">
        The <strong>Observer</strong> is Chasi's async event bus. One instance is created at boot from
        <code>src/config/observer.ts</code> and attached to the app as <code>$observer</code>. It powers
        the server lifecycle (<tag v-bind="{ name: '__before__', style: 'is-link', reference: 'obs-lifecycle' }" />,
        <tag v-bind="{ name: '__ready__', style: 'is-link', reference: 'obs-lifecycle' }" />, etc.) and
        lets you register your own named <strong>Events</strong> for decoupled side effects — logging,
        notifications, cache invalidation — without bloating controllers.
      </span>
    </section>

    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-3">
          <span><hook id="obs-execution" /> How events run</span>
        </div>
      </div>
      <span class="sub-text">
        Custom events must be listed in <code>src/config/observer.ts</code> under
        <tag v-bind="{ name: 'events', style: 'is-primary', reference: 'obs-events' }" />
        before you can <code>emit()</code> them — only aliases registered at boot (via
        <code>Observer.setup()</code>) are loaded and wired to the emitter.
      </span>
      <span class="sub-text" style="display: block; margin-top: 1rem;">
        When an event is dispatched, the Observer runs its pipeline on the async emitter
        (<code>validate</code> → <code>onemit</code> → <code>fire</code> → <code>fireListeners</code> →
        <code>emitted</code>) in a path that is <strong>isolated from the HTTP request</strong>.
        In a controller, if you call <code>this.$observer.emit(...)</code> <em>without</em>
        <code>await</code>, the handler can send the response immediately while the event keeps
        running in the background — the client may already have the response before
        <code>fire()</code> finishes. Use that for side effects you do not want to block the request;
        use <code>await this.$observer.emit(...)</code> only when the response must wait for the event.
      </span>
    </section>

    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-3">
          <span><hook id="observerConfig" /> Configuration</span>
          <span class="tag is-info is-light is-medium">&lt;ObserverConfig&gt;</span>
        </div>
        <small>
          <span class="subtitle">[./src/config/observer.ts]</span>
        </small>
      </div>
      <span class="sub-text">
        <tag v-bind="{ name: 'ObserverConfig', style: 'is-primary', reference: 'obs-ObserverConfig' }" />
        is the typed shape of this file. It has three members: an <code>events</code> registry,
        and optional global <code>beforeEmit</code> / <code>afterEmit</code> hooks that wrap every
        custom event's <code>fire()</code> unless an event class overrides them.
      </span>
    </section>
    <list
      :items="configList.list"
      :header="{ name: '<ObserverConfig>', hook: 'observerConfig' }"
    />

    <section class="section">
      <div class="pan-title">
        <div class="x-center is-size-3">
          <span><hook id="observerEvents" /> Events</span>
          <span class="tag is-info is-light is-medium">EventInterface</span>
        </div>
        <small>
          <span class="subtitle">[./src/container/events/] · [package/Observer/Event.ts]</span>
        </small>
      </div>
      <span class="sub-text">
        An <strong>Event</strong> is a class extending
        <code>package/Observer/Event.ts</code> and implementing
        <tag v-bind="{ name: 'EventInterface', style: 'is-primary', reference: 'obs-event-class' }" />.
        When you call <tag v-bind="{ name: 'emit()', style: 'is-link', reference: 'obs-emit' }" />,
        the Observer runs: <code>validate</code> → <code>onemit</code> (global <code>beforeEmit</code>) →
        <code>fire</code> → <code>fireListeners</code> (<tag v-bind="{ name: 'when()', style: 'is-link', reference: 'obs-when' }" /> callbacks) →
        <code>emitted</code> (global <code>afterEmit</code>).
      </span>
    </section>

    <list
      :items="eventInterfaceList.list"
      :header="{ name: '<EventInterface>', hook: 'observerEvents' }"
    />

    <list
      :items="eventsApiList.list"
      :header="{ name: 'Observer API', desc: 'dispatch & lifecycle', hook: 'obs-emit' }"
    />

    <section class="section">
      <div class="x-center is-size-5">
        <span><hook id="obs-emit" /> Emit from a controller</span>
      </div>
      <code-container mapping="observer/events/emit" :options="{ theme: 'vitesse-dark', lang: 'ts' }">
        <template v-slot:comment>
          <p>Controller — dispatch a registered event</p>
        </template>
      </code-container>
    </section>

    <section class="section">
      <div class="x-center is-size-5">
        <span><hook id="obs-event-class" /> Define a custom event</span>
      </div>
      <code-container mapping="observer/events/eventClass" :options="{ theme: 'vitesse-dark', lang: 'ts' }">
        <template v-slot:comment>
          <p>Event class — e.g. ./src/container/events/Authorize.ts</p>
        </template>
      </code-container>
    </section>

    <section class="section">
      <div class="x-center is-size-5">
        <span><hook id="obs-when" /> Listen with when()</span>
      </div>
      <code-container mapping="observer/events/when" :options="{ theme: 'vitesse-dark', lang: 'ts' }">
        <template v-slot:comment>
          <p>Service provider — hook __ready__ at boot</p>
        </template>
      </code-container>
    </section>
  </div>
</template>

<script setup>
import tag from "@/components/utils/tag/tag.vue"
import { reactive } from "vue"
import { useControlStore } from "@/stores/ControlStore"

const ctx = useControlStore()
const observer = ctx.dict["observer"]

const configList = reactive({
  list: [
    {
      hook: "obs-events",
      title: "events",
      sub: "[ObserverConfig.events]",
      tag: "events",
      desc: `Required registry before <code>emit()</code> works for custom events. Add every alias here with its class path (relative to <code>src/</code>, no extension). Unregistered aliases are not loaded at boot and will not run. Entries are registered in <code>Observer.setup()</code> on startup.`,
      codeContent: {
        mapping: "observer/config/events",
        comment: "// src/config/observer.ts",
        options: { lang: "ts", theme: "vitesse-dark" },
      },
    },
    {
      hook: "obs-beforeEmit",
      title: "beforeEmit",
      sub: "[ObserverConfig.beforeEmit]",
      tag: "(params) => Promise<void>",
      desc: `Global hook run in <code>onemit()</code> before <code>fire()</code>. <code>this</code> is the Event instance; <code>params</code> is the emit payload. Skipped when the event class defines its own <code>onemit</code> / <code>beforeEmit</code>.`,
      codeContent: {
        mapping: "observer/config/beforeEmit",
        options: { lang: "ts", theme: "vitesse-dark" },
      },
    },
    {
      hook: "obs-afterEmit",
      title: "afterEmit",
      sub: "[ObserverConfig.afterEmit]",
      tag: "(params) => Promise<void>",
      desc: `Global hook run in <code>emitted()</code> after <code>fire()</code> and listeners finish. Use for audit trails or metrics. Skipped when the event defines its own <code>emitted</code> / <code>afterEmit</code>.`,
      codeContent: {
        mapping: "observer/config/afterEmit",
        options: { lang: "ts", theme: "vitesse-dark" },
      },
    },
    {
      hook: "obs-ObserverConfig",
      title: "ObserverConfig",
      sub: "[package/Observer/index.ts]",
      tag: "type",
      desc: `Exported type: <code>{ events: events; beforeEmit: Function; afterEmit: Function }</code>. The <code>events</code> field uses <code>Record&lt;string, string&gt;</code> (alias → class path).`,
    },
  ],
})

const eventInterfaceList = reactive({
  list: [
    {
      hook: "obs-ev-props",
      title: "props",
      sub: "[EventInterface.props]",
      tag: "{ [key: string]: any }",
      desc: `Injected hook bag from config — holds global <code>beforeEmit</code> and <code>afterEmit</code> when the event class does not override them.`,
    },
    {
      hook: "obs-ev-logger",
      title: "logger",
      sub: "[EventInterface.logger]",
      tag: "Writer",
      desc: `Log writer instance on the event (base <code>Event</code> uses <code>Logger.writer("StartTrace")</code>).`,
    },
    {
      hook: "obs-ev-listeners",
      title: "listeners",
      sub: "[EventInterface.listeners]",
      tag: "Listener[]",
      desc: `Listeners attached via <code>$observer.when()</code>; invoked in <code>fireListeners()</code> after <code>fire()</code>.`,
    },
    {
      hook: "obs-ev-validate",
      title: "validate",
      sub: "[EventInterface.validate]",
      tag: "(params, next) => void",
      desc: `Gate before the pipeline continues. Must call <code>next()</code> to proceed to <code>onemit</code> / <code>fire</code>; throw or omit <code>next()</code> to abort.`,
    },
    {
      hook: "obs-ev-onemit",
      title: "onemit",
      sub: "[EventInterface.onemit]",
      tag: "() => Promise<void>",
      desc: `Runs before <code>fire()</code>. Base implementation applies global <code>beforeEmit</code> from <code>props</code>. Override to replace the global hook for this event.`,
    },
    {
      hook: "obs-ev-fire",
      title: "fire",
      sub: "[EventInterface.fire]",
      tag: "(params) => void | Promise<void>",
      desc: `Main handler — implement your side effects here. Receives the payload passed to <code>emit()</code> (also on <code>this.options</code> in the base class).`,
    },
    {
      hook: "obs-ev-fireListeners",
      title: "fireListeners",
      sub: "[EventInterface.fireListeners]",
      tag: "() => Promise<void>",
      desc: `Runs all <code>when()</code> callbacks registered for this event alias.`,
    },
    {
      hook: "obs-ev-emitted",
      title: "emitted",
      sub: "[EventInterface.emitted]",
      tag: "() => Promise<void>",
      desc: `Runs after <code>fire()</code> and listeners. Base implementation applies global <code>afterEmit</code> from <code>props</code>. Override to replace the global hook.`,
    },
  ],
})

const eventsApiList = reactive({
  list: [
    {
      hook: "obs-execution",
      title: "Execution model",
      sub: "[async / detached]",
      tag: "behavior",
      desc: `Events run through <code>AsyncEventEmitter</code>, separate from Express request/response timing. Omit <code>await</code> on <code>emit()</code> in controllers to return the HTTP response while the event pipeline still runs. Errors inside detached events do not change an already-sent status code — handle failures inside <code>fire()</code> or use <code>await emit()</code> when the client must wait.`,
    },
    {
      hook: "obs-emit",
      title: "$observer.emit()",
      sub: "[Observer.emit]",
      tag: "(event, params?) => Promise<void>",
      desc: `Dispatch a <strong>registered</strong> event by alias (must exist in <code>observer.ts</code> <code>events</code>). On controllers: <code>this.$observer</code>. Fire-and-forget: <code>this.$observer.emit("authorized", payload)</code> without <code>await</code>. Block the handler until done: <code>await this.$observer.emit(...)</code>.`,
    },
    {
      hook: "obs-when",
      title: "$observer.when()",
      sub: "[Observer.when]",
      tag: "(key, fn, opts?) => void",
      desc: `Subscribe a listener to an event. The callback receives <code>(listenerParams, emitParams)</code>. Common for wiring service providers to <code>__ready__</code> and other lifecycle events.`,
    },
    {
      hook: "obs-lifecycle",
      title: "Lifecycle events",
      sub: "[horizon/events]",
      tag: "built-in",
      desc: `Framework events orchestrate boot: <code>__before__</code>, <code>__initialize__</code>, <code>__after__</code>, <code>__boot__</code>, <code>__ready__</code>, <code>__exception__</code>. These live under <code>package/statics/horizon/events/</code> and are not listed in <code>observer.ts</code> — they are registered internally by the framework.`,
    },
  ],
})
</script>

<style scoped></style>
