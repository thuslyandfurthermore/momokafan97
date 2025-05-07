## stepstate = the clicked squares
## 0 for unclicked, 1 for clicked

## boardstate = the black and white state of each square
## 0 for white, 1 for black

from collections import defaultdict
import json
from math import floor

### why wrap with zeros?
# extending the board space one square in each direction allows the cross shape to be bitshifted across the board without wrapping around improperly, basically
def wrapWithZeros(bitmask, w, h):
  # we're passing this an int, so we'll make it a binary string with the right amount of padding first of all
  bitmask = format(bitmask, 'b').zfill(w*h)
  bitarray = []
  
  # this splits the string into w length chunks in a list
  for i in range(h):
    bitarray.append(bitmask[:w])
    bitmask = bitmask[w:]
  
  # zstring is padding for top and bottom
  zstring = "".zfill(w + 2)
  result = zstring
  for i in range(len(bitarray)):
    result = result + '0' + bitarray[i] + '0'
  result = result + zstring
  
  # return as an int so we can do bitshifty stuff on it
  return int(result, 2)

def stripZeros(bitmask, w, h):
  
  # again format as binary text first
  bitmask = format(bitmask, 'b').zfill((w + 2) * (h + 2))
  
  # chunk the string into w+2 long pieces
  bitarray = []
  for i in range(h + 2):
    bitarray.append(bitmask[:w + 2])
    bitmask = bitmask[w + 2:]
  
  # delete the first and last chunk
  del(bitarray[0])
  del(bitarray[-1])
  
  # delete the first and last char of each chunk
  result = ''
  for i in range(len(bitarray)):
    bitarray[i] = bitarray[i][1:]
    bitarray[i] = bitarray[i][:-1]
    result = result + bitarray[i]
  return result

# unused for speed but maybe i should add it back in
def formatBoardstate(bitmask, w, h):
  # again, chunk and add newlines
  result = ''
  for i in range(h):
    result = result + (bitmask[:w] + '\n')
    bitmask = bitmask[w:]
  return result


def stepstateToBoardstate(stepstate, w, h):
  
  # flipping = xor
  # the boardstate is dependent only on the stepstate, not any ordering or anything
  ### flipping one at a time is the same as flipping all at once
  
  # so we take the entire stepstate, shift it left right up and down, xoring with the previous step each time, so every 1 flips a cross
  stepstate = wrapWithZeros(stepstate, w, h)
  result = stepstate
  result ^= stepstate << 1
  result ^= stepstate >> 1
  result ^= stepstate << w  + 2
  result ^= stepstate >> w  + 2
  return stripZeros(result, w, h)

def generateDict(w,h):
  
  # iterates through all possible stepstates and saves the result in a dictionary as {'boardstate':[stepstate, stepstate, ...]}
  
  # defaultdict makes the operation the same whether the key exists or not
  data = defaultdict(list)
  
  # O(2^n) lol
  for i in range(2**(w*h)):
    data[stepstateToBoardstate(i, w, h)].append(format(i, 'b').zfill(w*h))
    if i%100==0:
      print('\ncalculating ' + format(w) + 'x' + format(h))
      print(format(i) + ' of ' + format(2**(w*h)))
      print(format((i / (2**(w*h)) * 100)) + '%')
      print(formatBoardstate(stepstateToBoardstate(i, w, h), w, h))
  return data

out = open('equivalencies.json', 'w')

# wrapped like this so it saves the json properly
equivalencies = {'equivalencies':[]}

# save all the stepstates that result in a 0 boardstate
equivalencies['equivalencies'].append(generateDict(2,2)[''.zfill(4)])
equivalencies['equivalencies'].append(generateDict(3,3)[''.zfill(9)])
equivalencies['equivalencies'].append(generateDict(4,4)[''.zfill(16)])
equivalencies['equivalencies'].append(generateDict(5,5)[''.zfill(25)])
#equivalencies['equivalencies'].append(generateDict(6,6)[''.zfill(36)])
# for 5x5 it spits out,,,,, 3 nontrivial equivalencies
# if i wanted to extend this to 6x6 itd have to run on my phone for between one and ten days

json.dump(equivalencies, out)
