import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryColumn, } from 'typeorm'
import { Planet } from '../../planets/entities/planet.entity'
import { Film } from '../../films/entities/film.entity'
import { Specie } from '../../species/entities/specie.entity'
import { Vehicle } from '../../vehicles/entities/vehicle.entity'
import { Starship } from '../../starships/entities/starship.entity'
import { Image } from '../../images/entities/image.entity'
import { ApiProperty } from '@nestjs/swagger'

@Entity()
export class People {
  @PrimaryColumn()
  @ApiProperty({example: 'https://swapi.dev/api/people/1/'})
  'url': string
  @Column()
  @ApiProperty({example: 'Luke Skywalker'})
  'name': string
  @Column()
  @ApiProperty({example: '19BBY'})
  'height': string
  @Column()
  @ApiProperty({example: '77'})
  'mass': string
  @Column()
  @ApiProperty({example: 'blond'})
  'hair_color': string
  @Column()
  @ApiProperty({example: 'fair'})
  'skin_color': string
  @Column()
  @ApiProperty({example: 'blue'})
  'eye_color': string
  @Column()
  @ApiProperty({example: '172'})
  'birth_year': string
  @Column()
  @ApiProperty({example: 'male'})
  'gender': string

  @ApiProperty({example: '1'})
  @OneToMany(() => Image, (image) => image.people)
  'images': Image[]

  @ApiProperty({example: ['https://swapi.dev/api/planets/1/', '...']})
  @ManyToOne(() => Planet, (planet) => planet.residents, {
    onDelete: 'SET NULL',
  })
  'homeworld': Planet //planet

  @ApiProperty({example: ['https://swapi.dev/api/films/1/', '...']})
  @ManyToMany(() => Film, (film) => film.characters, {onDelete: 'CASCADE'})
  films: Film[] //films

  @ApiProperty({example: []})
  @ManyToMany(() => Specie, (specie) => specie.people, {onDelete: 'CASCADE'})
  @JoinTable({name: 'people_species'})
  'species': Specie[] //species

  @ApiProperty({example: ['https://swapi.dev/api/vehicles/14/', '...']})
  @ManyToMany(() => Vehicle, (vehicle) => vehicle.pilots, {
    onDelete: 'CASCADE',
  })
  @JoinTable({name: 'people_vehicles'})
  'vehicles': Vehicle[] //vehicles

  @ApiProperty({example: ['https://swapi.dev/api/starships/12/', '...']})
  @ManyToMany(() => Starship, (starship) => starship.pilots, {
    onDelete: 'CASCADE',
  })
  @JoinTable({name: 'people_starships'})
  'starships': Starship[] //starships

  @ApiProperty({example: '2014-12-20T20:48:02.977000'})
  @Column()
  'created': string
  @ApiProperty({example: '2014-12-20T21:17:56.891000'})
  @Column()
  'edited': string
}
