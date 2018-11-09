define([
    'module',
    './iframer',
    'css!./panel.css'
], function (
    module,
    Iframer
) {
    'use strict';

    // The module url includes the initial / and, so we start after that,
    // and we also remove this file and the modules directory.
    const pluginPath = module.uri.split('/').slice(1, -2).join('/');

    class Panel {
        constructor(config) {
            this.runtime = config.runtime;
            this.iframer = null;
            this.hostNode = null;
            this.container = null;
        }

        attach(node) {
            this.hostNode = node;
            this.container = node.appendChild(document.createElement('div'));
            this.container.classList.add('organizations-panel');
            this.container.style.flex = '1 1 0px';
            this.container.style.display = 'flex';
            this.container.style['flex-direction'] = 'column';
        }

        start() {
            this.iframer = new Iframer({
                runtime: this.runtime,
                node: this.container,
                pluginPath: pluginPath,
                params: {
                    groupsServiceURL: this.runtime.config('services.Groups.url'),
                    userProfileServiceURL: this.runtime.config('services.UserProfile.url'),
                    workspaceServiceURL: this.runtime.config('services.Workspace.url')
                }
            });

            this.runtime.send('ui', 'setTitle', 'Organizations');

            return this.iframer.start();
        }

        stop() {
            if (this.hostNode && this.container) {
                this.hostNode.removeChild(this.container);
            }
            if (this.iframer) {
                return this.iframer.stop();
            }
        }
    }
    return Panel;
});