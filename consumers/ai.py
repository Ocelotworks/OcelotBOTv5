import gpt_2_simple as gpt2

gpt2.download_gpt2()   # model is saved into current directory under /models/124M/

sess = gpt2.start_tf_sess()
gpt2.finetune(sess, '../data.txt', steps=1000)   # steps is max number of training steps

gpt2.generate(sess)