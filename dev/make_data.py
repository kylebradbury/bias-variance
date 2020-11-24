# -*- coding: utf-8 -*-

import numpy as np
import matplotlib.pyplot as plt
import pandas as pd

def gen_data(N,class_frac):
    N1 = int(np.ceil(class_frac*N))
    N0 = N - N1
    X1 = np.random.multivariate_normal(mean=[0.5,0.5],cov=np.identity(2),size=N1)
    y1 = np.ones((N1))
    X0 = np.random.multivariate_normal(mean=[-0.5,-0.5],cov=np.identity(2),size=N0)
    y0 = np.zeros((N0))
    X = np.concatenate((X1,X0),axis=0)
    y = np.concatenate((y1,y0),axis=0)
    return (X,y)
    
X,y = gen_data(100,0.5)
plt.plot(X[y==0][:,0],X[y==0][:,1],'r.')
plt.plot(X[y==1][:,0],X[y==1][:,1],'b.')

df = pd.DataFrame({'x0':X[:,0], 'x1':X[:,1], 'y':y})
df = df.sample(frac=1).reset_index(drop=True)
df.to_csv('data.csv',index=False)