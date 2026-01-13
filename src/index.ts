import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';

/**
 * Initialization data for the notebook-path-injector extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'notebook-path-injector:plugin',
  autoStart: true,
  requires: [INotebookTracker],
  activate: (app: JupyterFrontEnd, notebookTracker: INotebookTracker) => {
    console.log('JupyterLab extension notebook-path-injector is activated!');

    // Define the function that injects the variable
    const injectPath = async (panel: NotebookPanel) => {
      const path = panel.context.path;
      const sessionContext = panel.sessionContext;

      // Wait for the session to be ready
      await sessionContext.ready;

      const code = `__nbname__ = "${path}"`;

      // Execute the code silently in the kernel
      sessionContext.session?.kernel?.requestExecute({
        code: code,
        silent: true,
        store_history: false
      });

      console.log(`Injected __nbname__ = "${path}" into kernel.`);
    };

    // 1. Handle notebooks already open on reload
    notebookTracker.forEach(panel => {
      injectPath(panel);
    });

    // 2. Handle notebooks opened during the session
    notebookTracker.widgetAdded.connect((sender, panel) => {
      injectPath(panel);
    });
  }
};

export default plugin;
