MuSheetCell -> WithoutSubdivision | WithSubdivision

WithoutSubdivision -> null | Notes

Notes -> Notes Spaces Note
       | Note

Note -> Letter Accidentals
      | "_"

Letter -> [a-gA-G]

Accidentals -> [b#]:*

WithSubdivision -> WithoutSubdivision PossibleSpaces SubDivision PossibleSpaces WithoutSubdivision

SubDivision -> ";" SubDivisionLevel:?

SubDivisionLevel -> [0-9]:+

Spaces -> [ ]:+

PossibleSpaces -> [ ]:*




