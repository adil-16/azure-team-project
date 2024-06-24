const axios = require('axios');

const getProjects = async () => {
  const orgUrl = process.env.AZURE_DEVOPS_ORG_URL;
  const token = process.env.AZURE_DEVOPS_PERSONAL_ACCESS_TOKEN;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`:${token}`).toString('base64')}`
    }
  };

  try {
    const response = await axios.get(`${orgUrl}/_apis/projects?api-version=6.0`, config);
    console.log(response.data);
    return response.data;
  }  catch (error) {
    throw new Error(`Failed to fetch projects: ${error.message}`);
  }
}

const getWorkItems = async (project, ids) => {
    const orgUrl = process.env.AZURE_DEVOPS_ORG_URL;
    const token = process.env.AZURE_DEVOPS_PERSONAL_ACCESS_TOKEN;
  
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`:${token}`).toString('base64')}`
      }
    };
  
    try {
      const response = await axios.get(`${orgUrl}/${project}/_apis/wit/workitems?ids=${ids}&api-version=7.1-preview.3`, config);
      return response.data;
    } catch (error) {
        throw new Error(`Failed to fetch work itmes: ${error.message}`);
      }
  }


  const getWorkItemHistory = async (project, id) => {
    const orgUrl = process.env.AZURE_DEVOPS_ORG_URL;
    const token = process.env.AZURE_DEVOPS_PERSONAL_ACCESS_TOKEN;
  
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`:${token}`).toString('base64')}`
      }
    };
  
    try {
      const response = await axios.get(`${orgUrl}/${project}/_apis/wit/workItems/${id}/updates?api-version=7.1-preview.3`, config);
      return response.data;
    } catch (error) {
      if (error.response) {
        console.error(`Error response: ${error.response.status} - ${error.response.statusText}`);
        console.error(`Error details: ${JSON.stringify(error.response.data)}`);
        throw new Error(`Failed to fetch work item history: ${error.response.status} - ${error.response.statusText}`);
      } else if (error.request) {
        console.error('Error request: No response received');
        console.error(error.request);
        throw new Error('Failed to fetch work item history: No response received');
      } else {
        console.error('Error message:', error.message);
        throw new Error(`Failed to fetch work item history: ${error.message}`);
      }
    }
  }

  const getTotalWorkItems = async (req, res) => {
    const orgUrl = process.env.AZURE_DEVOPS_ORG_URL;
    const token = process.env.AZURE_DEVOPS_PERSONAL_ACCESS_TOKEN;

    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${Buffer.from(`:${token}`).toString('base64')}`
        }
    };

    let totalWorkItemsCount = 0;

    try {
        const projectsResponse = await axios.get(`${orgUrl}/_apis/projects?api-version=6.0`, config);
        const projects = projectsResponse.data.value;

        for (const project of projects) {
            const projectName = project.name;

            const wiqlQuery = {
                query: `
                    SELECT [System.Id]
                    FROM WorkItems
                    WHERE [System.TeamProject] = '${projectName}'
                `,
                parameters: [
                    { name: 'projectName', value: projectName }
                ]
            };

            const response = await axios.post(`${orgUrl}/${encodeURIComponent(projectName)}/_apis/wit/wiql?api-version=7.1`, wiqlQuery, config);
            
             const workItems = response.data.workItems;

          //   for (const workItem of workItems) {
          //     const workItemId = workItem.id;
              
          //     const workItemResponse = await axios.get(`${orgUrl}/${encodeURIComponent(projectName)}/_apis/wit/workitems/${workItemId}?$expand=all&api-version=7.1`, config);
          //     const detailedWorkItem = workItemResponse.data;

          //     // Push detailed work item information to totalWorkItems array
          //     console.log(detailedWorkItem);
          // }
            totalWorkItemsCount += workItems.length;
        }

        return totalWorkItemsCount;

    } catch (error) {
        // Handle errors
        if (error.response) {
            console.error(`Error response: ${error.response.status} - ${error.response.statusText}`);
            console.error(`Error details: ${JSON.stringify(error.response.data)}`);
            res.status(error.response.status).json({ error: `Failed to fetch total work items: ${error.response.status} - ${error.response.statusText}` });
        } else if (error.request) {
            console.error('Error request: No response received');
            console.error(error.request);
            res.status(500).json({ error: 'Failed to fetch total work items: No response received' });
        } else {
            console.error('Error message:', error.message);
            res.status(500).json({ error: `Failed to fetch total work items: ${error.message}` });
        }
    }
}

const getProjectWorkItems = async (projectName) => {
  const orgUrl = process.env.AZURE_DEVOPS_ORG_URL;
  const token = process.env.AZURE_DEVOPS_PERSONAL_ACCESS_TOKEN;

  if (!projectName) {
      return res.status(400).json({ error: 'Project name is required' });
  }

  const config = {
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`:${token}`).toString('base64')}`
      }
  };

  try {
      const wiqlQuery = {
          query: `
              SELECT [System.Id]
              FROM WorkItems
              WHERE [System.TeamProject] = '${projectName}'
          `
      };

      const response = await axios.post(`${orgUrl}/${encodeURIComponent(projectName)}/_apis/wit/wiql?api-version=7.1`, wiqlQuery, config);
      const workItems = response.data.workItems;

      
      const detailedWorkItems = [];

      
      for (const workItem of workItems) {
          const workItemId = workItem.id;
          const workItemResponse = await axios.get(`${orgUrl}/${encodeURIComponent(projectName)}/_apis/wit/workitems/${workItemId}?$expand=all&api-version=7.1`, config);
          detailedWorkItems.push(workItemResponse.data);
      }

      
      return { workItems: detailedWorkItems };

  } catch (error) {
      // Handle errors
      if (error.response) {
          console.error(`Error response: ${error.response.status} - ${error.response.statusText}`);
          console.error(`Error details: ${JSON.stringify(error.response.data)}`);
          res.status(error.response.status).json({ error: `Failed to fetch work items: ${error.response.status} - ${error.response.statusText}` });
      } else if (error.request) {
          console.error('Error request: No response received');
          console.error(error.request);
          res.status(500).json({ error: 'Failed to fetch work items: No response received' });
      } else {
          console.error('Error message:', error.message);
          res.status(500).json({ error: `Failed to fetch work items: ${error.message}` });
      }
  }
};

module.exports = {
  getProjects,
  getWorkItems,
  getWorkItemHistory,
  getTotalWorkItems,
  getProjectWorkItems
};