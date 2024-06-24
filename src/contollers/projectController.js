const azureDevOpsService = require('../services/azureServices');

exports.getAllProjects = async (req, res) => {
  try {
    const projects = await azureDevOpsService.getProjects();
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.getWorkItems = async (req, res) => {
    const { project, ids } = req.body;
  
    if (!project || !ids) {
      return res.status(400).json({ message: 'Project and IDs are required parameters.' });
    }
  
    try {
      const workItems = await azureDevOpsService.getWorkItems(project, ids);
      res.status(200).json(workItems);
    } catch (error) {
      console.error(`Controller error: ${error.message}`);
      res.status(500).json({ message: error.message });
    }
}

exports.getWorkItemHistory = async (req, res) => {
    const { project, id } = req.body;
  
    console.log(`Received request for work item history with project: ${project}, id: ${id}`);
  
    if (!project) {
      console.error('Missing project parameter');
      return res.status(400).json({ message: 'Project is a required parameter.' });
    }
  
    if (!id) {
      console.error('Missing id parameter');
      return res.status(400).json({ message: 'ID is a required parameter.' });
    }
  
    try {
      const data = await azureDevOpsService.getWorkItemHistory(project, id);

      let stateChanges = [];
      
      // Iterate through updates
      data.value.forEach(update => {
          const rev = update.rev;
          const newState = update.fields['System.State'] ? update.fields['System.State'].newValue : null;
          const changeDate = update.fields['Microsoft.VSTS.Common.StateChangeDate'] ? new Date(update.fields['Microsoft.VSTS.Common.StateChangeDate'].newValue) : null;
      
          if (newState && changeDate) {
              stateChanges.push({
                  revision: rev,
                  state: newState,
                  changeDate: changeDate
              });
          }
      });
      
      stateChanges.sort((a, b) => a.changeDate - b.changeDate);
      
      let timeInState = {};
      let previousState = null;
      let lastChangeDate = null;
      
      stateChanges.forEach(change => {
          const currentState = change.state;
          const changeDate = change.changeDate;
      
          if (currentState !== previousState) {
              if (previousState !== null && lastChangeDate !== null) {
                  if (!timeInState[previousState]) {
                      timeInState[previousState] = 0;
                  }
                  timeInState[previousState] += Math.floor((changeDate - lastChangeDate) / 1000); // Difference in seconds
              }
              previousState = currentState;
              lastChangeDate = changeDate;
          }
      });
      
      if (previousState !== null && lastChangeDate !== null) {
          if (!timeInState[previousState]) {
              timeInState[previousState] = 0;
          }
          timeInState[previousState] += Math.floor((new Date() - lastChangeDate) / 1000); // Difference till now in seconds
      }

      let timeInStateHours = {
        "To Do" : 0,
        "Doing" : 0,
        "TESTING" : 0,
        "Done" : 0,
        }
      Object.keys(timeInState).forEach(state => {
          timeInStateHours[state] = timeInState[state];
      });
      
      console.log(timeInStateHours);
      
      res.status(200).json(
      {
        "data" : timeInStateHours
      }
      )

    } catch (error) {
      console.error(`Controller error: ${error.message}`);
      res.status(500).json({ message: error.message });
    }
  }

  exports.getTotalWorkItems = async (req, res) => {

  
    try {
      const totalWorkItem = await azureDevOpsService.getTotalWorkItems();
      console.log(totalWorkItem)
      res.status(200).json(totalWorkItem);
    } catch (error) {
      console.error(`Controller error: ${error.message}`);
      res.status(500).json({ message: error.message });
    }
}

exports.getProjectWorkItems = async (req, res) => {

  const { projectName  } = req.body;
  

 try {
    const workItems = await azureDevOpsService.getProjectWorkItems(projectName);
    console.log("work items", workItems);
    res.status(200).json(workItems);
  } catch (error) {
    console.error(`Controller error`);
    res.status(500).json({ message: error.message });
  }
}

  