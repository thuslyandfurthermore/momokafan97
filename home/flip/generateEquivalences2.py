## stepstate = the clicked squares
## 0 for unclicked, 1 for clicked

## boardstate = the black and white state of each square
## 0 for white, 1 for black

import json
from math import floor

### why wrap with zeros?
# extending the board space one square in each direction allows the cross shape to be bitshifted across the board without wrapping around improperly, basically

def wrapWithZerosReal(bitmap, w, h):
  # we're gonna isolate w length chunks of the bitmap by anding the bitmap with a generated mask
  # eg:
  ## 1010 1010 1010 1010 &
  ## 0000 1111 0000 0000 =
  ## 0000 1010 0000 0000
  # then shift that chunk over such that its like
  ##0 0000 00 1010 00 0000 00 0000 0
  # and add up the chunks
  # then shift it one more chunk over
  
  result = 0
  # generate mask
  # w = 4 -> mask = 0b1111 = 15
  mask = pow(2, w) - 1
  for i in range(h):
    # i = 2 -> m<<w*i = 0b1111 0000 0000
    chunk = bitmap & (mask << (w * i))
    chunk <<= (i * 2) + 1
    result += chunk
  result <<= w + 2
  return result
  
def stripZerosReal(bitmap, w, h):
  w2 = w + 2
  mask = pow(2, w) - 1
  # remove last chunk
  bitmap >>= w2
  result = 0
  for i in range(h):
    chunk = bitmap & (mask << (w2 * i + 1))
    chunk >>= (i * 2) + 1
    result += chunk
  # clip to final size
  result = result & (pow(2, w*h) - 1)
  return result
  

# unused for speed but maybe i should add it back in
def formatBoardstate(bitmap, w, h):
  # again, chunk and add newlines
  bitmap = format(bitmap, 'b').zfill(w * h)
  result = ''
  for i in range(h):
    result = result + (bitmap[:w] + '\n')
    bitmap = bitmap[w:]
  return result


def stepstateToBoardstate(stepstate, w, h):
  
  # flipping = xor
  # the boardstate is dependent only on the stepstate, not any ordering or anything
  ### flipping one at a time is the same as flipping all at once
  
  # so we take the entire stepstate, shift it left right up and down, xoring with the previous step each time, so every 1 flips a cross
  stepstate = wrapWithZerosReal(stepstate, w, h)
  result = stepstate
  result ^= stepstate << 1
  result ^= stepstate >> 1
  result ^= stepstate << w + 2
  result ^= stepstate >> w + 2
  return stripZerosReal(result, w, h)

def has_even_ones_xor(n):
    count = 0
    while n:
        count ^= n & 1  # XOR the least significant bit
        n >>= 1         # Shift the number to the right
    return count == 0

def generateZeroes(w,h):
  
  # iterates through all possible stepstates and saves the result in a dictionary as {'boardstate':[stepstate, stepstate, ...]}
  
  data = []
  
  # O(2^n) lol
  for i in range(2 ** (w * h)):
    if has_even_ones_xor(i):
      test = stepstateToBoardstate(i, w, h)
      if test == 0:
        data.append(format(i, 'b'))
    
    if i%1000==0:
      print('\ncalculating ' + format(w) + 'x' + format(h))
      print(format(i) + ' of ' + format(2**(w*h)))
      print(format((i / (2**(w*h)) * 100)) + '%')
      #print(formatBoardstate(stepstateToBoardstate(i, w, h), w, h))
  return data

out = open('equivalencies.json', 'w')

# wrapped like this so it saves the json properly
equivalencies = {'equivalencies':[]}

# save all the stepstates that result in a 0 boardstate
equivalencies['equivalencies'].append(generateZeroes(2,2))
equivalencies['equivalencies'].append(generateZeroes(3,3))
equivalencies['equivalencies'].append(generateZeroes(4,4))
equivalencies['equivalencies'].append(generateZeroes(5,5))
#equivalencies['equivalencies'].append(generateZeroes(6,6))
# for 5x5 it spits out,,,,, 3 nontrivial equivalencies
# if i wanted to extend this to 6x6 itd have to run on my phone for between one and ten days

# solutions are unique for square boards above 5x5....... until 9x9........ for some reason
equivalencies['equivalencies'].append(["0"])
equivalencies['equivalencies'].append(["0"])

# print(format(45, 'b'))
# print(formatBoardstate(stepstateToBoardstate(45,4,4),4,4))

json.dump(equivalencies, out)
