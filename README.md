# HA Scenarios Apps Deployment on K3S Cluster
## This project deploys :

* Nextcloud platform
* MariaDB database
* Redis cache
* MongoDB database
* Nginx 
* Simple React/Node webapp
* Continuous deployment pipeline with Jenkins

### Nectcloud
Nextcloud is deployed using a Deployment and HORIZONTAL POD AUTOSCALER. Persistent storage is provided by manually creating a PersistentVolume and PersistentVolumeClaim.

### MariaDB
The MariaDB database is used as the backend for Nextcloud. It is deployed as a StatefulSet with a PersistentVolume and PersistentVolumeClaim to provide persistent storage.

### Redis
Integrating Redis provides caching and improves Nextcloud performance. Redis is deployed as a Deployment and Service.

### MongoDB + MongoExpress
MongoDB is deployed as a StatefulSet to store additional metadata. Mongo Express is also deployed to simplify database management .

### Nginx will never die
Nginx acts as a reverse proxy and load balancer. It is deployed as a Deployment with a HORIZONTAL POD AUTOSCALER to automatically scale based on CPU usage. The Kubernetes metric server must first be deployed to enable HPA.

````kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml````

```
❯ k describe hpa nginx-hpa
Name:                                                  nginx-hpa
Namespace:                                             nextcloud
Labels:                                                <none>
Annotations:                                           <none>
CreationTimestamp:                                     Thu, 11 Jan 2024 18:58:35 +0000
Reference:                                             Deployment/nginx-deployment
Metrics:                                               ( current / target )
  resource cpu on pods  (as a percentage of request):  1% (1m) / 80%
Min replicas:                                          2
Max replicas:                                          5
Deployment pods:                                       2 current / 2 desired
```

### Webapp
A simple React/Node webapp is deployed without building a Docker image. The frontend and backend code is mounted as volumes into separate containers in a pod.

### Continuous Deployment
Jenkins is currently deployed as a pod within the cluster. As workload increases, running it on a dedicated machine may better optimize resources.

A Jenkins pipeline has been configured for continuous deployment. It uses the Kubernetes plugin and references the kubeconfig file to deploy new versions triggered by GitHub webhooks.

This provides a fully automated and scalable Nextcloud deployment on Kubernetes. Future enhancements include migrating to Longhorn for storage and improving the CI/CD pipeline.

# Future Enhancements

## Computing Process
I would highly recommend using at least 8GB RAM for testing purposes. Upscaling computing resources is also important as a MUST
8 THREADS at least

## Storage
Migrating to Longhorn for storage, This will give a storage class we can provide for the applications

## Nginx Ingress Controller

In the future, I plan to deploy an Nginx Ingress Controller to provide ingress capabilities for the platform.

As more services are added, having an ingress controller will simplify exposing the applications via a single IP/domain name. The ingress controller can also provide advanced routing based on host names, paths, etc.
For more information, please refer to the official docs:
[Nginx ingress controller](https://docs.nginx.com/nginx-ingress-controller/overview/design/)

## Next cloud deployment
I will integrate Redis with Nextcloud pod 

## Using ArgoCD 
Argo CD follows the GitOps pattern of using Git repositories as the source of truth for defining the desired application state.

```
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```