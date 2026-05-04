import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ─── VEÍCULOS ─────────────────────────────────────────────────────────────────
const VEHICLES = [
  // Volkswagen
  { brand: 'Volkswagen', model: 'Gol', years: [2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021], engine: '1.0' },
  { brand: 'Volkswagen', model: 'Gol', years: [2005,2008,2012,2016,2020], engine: '1.6' },
  { brand: 'Volkswagen', model: 'Polo', years: [2003,2004,2005,2006,2007,2008,2009,2017,2018,2019,2020,2021,2022,2023], engine: '1.6' },
  { brand: 'Volkswagen', model: 'Polo', years: [2018,2019,2020,2021,2022,2023], engine: '1.0 TSI' },
  { brand: 'Volkswagen', model: 'Voyage', years: [2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021], engine: '1.6' },
  { brand: 'Volkswagen', model: 'Fox', years: [2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015], engine: '1.0' },
  { brand: 'Volkswagen', model: 'Saveiro', years: [2000,2005,2010,2015,2016,2017,2018,2019,2020,2021,2022], engine: '1.6' },
  { brand: 'Volkswagen', model: 'Golf', years: [2000,2006,2008,2013,2014,2015,2016,2017,2018,2019,2020,2021], engine: '2.0 TSI' },
  { brand: 'Volkswagen', model: 'T-Cross', years: [2020,2021,2022,2023,2024], engine: '1.0 TSI' },
  { brand: 'Volkswagen', model: 'Nivus', years: [2021,2022,2023,2024], engine: '1.0 TSI' },
  { brand: 'Volkswagen', model: 'Jetta', years: [2011,2012,2013,2014,2015,2019,2020,2021,2022,2023], engine: '1.4 TSI' },
  { brand: 'Volkswagen', model: 'Tiguan', years: [2009,2017,2018,2019,2020,2021,2022,2023], engine: '1.4 TSI' },
  // Fiat
  { brand: 'Fiat', model: 'Uno', years: [2000,2001,2002,2003,2004,2005,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019], engine: '1.0' },
  { brand: 'Fiat', model: 'Palio', years: [2000,2001,2002,2003,2004,2005,2006,2007,2008,2012,2013,2014,2015,2016], engine: '1.0' },
  { brand: 'Fiat', model: 'Palio', years: [2000,2005,2010,2014], engine: '1.6' },
  { brand: 'Fiat', model: 'Siena', years: [2000,2003,2006,2008,2010,2012,2014,2016], engine: '1.4' },
  { brand: 'Fiat', model: 'Punto', years: [2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017], engine: '1.4' },
  { brand: 'Fiat', model: 'Bravo', years: [2011,2012,2013,2014,2015], engine: '1.8' },
  { brand: 'Fiat', model: 'Mobi', years: [2016,2017,2018,2019,2020,2021,2022,2023], engine: '1.0' },
  { brand: 'Fiat', model: 'Argo', years: [2017,2018,2019,2020,2021,2022,2023,2024], engine: '1.3' },
  { brand: 'Fiat', model: 'Argo', years: [2018,2019,2020,2021,2022,2023], engine: '1.8' },
  { brand: 'Fiat', model: 'Cronos', years: [2018,2019,2020,2021,2022,2023,2024], engine: '1.3' },
  { brand: 'Fiat', model: 'Toro', years: [2016,2017,2018,2019,2020,2021,2022,2023,2024], engine: '1.8' },
  { brand: 'Fiat', model: 'Strada', years: [2000,2005,2010,2015,2021,2022,2023,2024], engine: '1.4' },
  { brand: 'Fiat', model: 'Doblò', years: [2001,2005,2010,2012,2014,2016,2018,2020,2022], engine: '1.8' },
  // Chevrolet
  { brand: 'Chevrolet', model: 'Corsa', years: [2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011], engine: '1.0' },
  { brand: 'Chevrolet', model: 'Celta', years: [2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012], engine: '1.0' },
  { brand: 'Chevrolet', model: 'Classic', years: [2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016], engine: '1.0' },
  { brand: 'Chevrolet', model: 'Prisma', years: [2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020], engine: '1.4' },
  { brand: 'Chevrolet', model: 'Cobalt', years: [2012,2013,2014,2015,2016,2017,2018,2019], engine: '1.8' },
  { brand: 'Chevrolet', model: 'Cruze', years: [2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023], engine: '1.4 Turbo' },
  { brand: 'Chevrolet', model: 'Onix', years: [2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024], engine: '1.0 Turbo' },
  { brand: 'Chevrolet', model: 'Onix', years: [2013,2014,2015,2016,2017,2018], engine: '1.4' },
  { brand: 'Chevrolet', model: 'Tracker', years: [2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024], engine: '1.0 Turbo' },
  { brand: 'Chevrolet', model: 'S10', years: [2000,2005,2012,2016,2017,2018,2019,2020,2021,2022,2023], engine: '2.5' },
  { brand: 'Chevrolet', model: 'Montana', years: [2003,2004,2005,2006,2007,2008,2009,2010,2011,2023,2024], engine: '1.4' },
  // Ford
  { brand: 'Ford', model: 'Fiesta', years: [2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014], engine: '1.0' },
  { brand: 'Ford', model: 'Ka', years: [2000,2001,2002,2003,2004,2005,2006,2007,2008,2014,2015,2016,2017,2018,2019,2020,2021], engine: '1.0' },
  { brand: 'Ford', model: 'Ka', years: [2015,2016,2017,2018,2019,2020], engine: '1.5' },
  { brand: 'Ford', model: 'Focus', years: [2003,2006,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019], engine: '2.0' },
  { brand: 'Ford', model: 'EcoSport', years: [2003,2004,2005,2006,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022], engine: '1.5' },
  { brand: 'Ford', model: 'Ranger', years: [2000,2005,2010,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023], engine: '2.5' },
  { brand: 'Ford', model: 'Territory', years: [2021,2022,2023,2024], engine: '1.5 EcoBoost' },
  // Toyota
  { brand: 'Toyota', model: 'Corolla', years: [2000,2003,2008,2013,2015,2017,2018,2019,2020,2021,2022,2023,2024], engine: '2.0' },
  { brand: 'Toyota', model: 'Etios', years: [2012,2013,2014,2015,2016,2017,2018,2019,2020,2021], engine: '1.5' },
  { brand: 'Toyota', model: 'Yaris', years: [2018,2019,2020,2021,2022,2023,2024], engine: '1.5' },
  { brand: 'Toyota', model: 'HiLux', years: [2000,2005,2010,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024], engine: '2.8 Diesel' },
  { brand: 'Toyota', model: 'SW4', years: [2006,2012,2015,2016,2017,2018,2019,2020,2021,2022,2023], engine: '2.8 Diesel' },
  { brand: 'Toyota', model: 'RAV4', years: [2000,2006,2013,2019,2020,2021,2022,2023,2024], engine: '2.5' },
  { brand: 'Toyota', model: 'Prius', years: [2012,2016,2017,2018,2019,2020,2021,2022,2023], engine: '1.8 Híbrido' },
  // Honda
  { brand: 'Honda', model: 'Civic', years: [2000,2001,2002,2003,2006,2007,2008,2009,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024], engine: '2.0' },
  { brand: 'Honda', model: 'Fit', years: [2003,2004,2005,2006,2009,2010,2011,2012,2015,2016,2017,2018,2019,2020], engine: '1.5' },
  { brand: 'Honda', model: 'City', years: [2009,2010,2011,2012,2013,2014,2015,2021,2022,2023,2024], engine: '1.5' },
  { brand: 'Honda', model: 'HR-V', years: [2015,2016,2017,2018,2019,2020,2021,2022,2023,2024], engine: '1.8' },
  { brand: 'Honda', model: 'CR-V', years: [2007,2010,2012,2015,2017,2018,2019,2020,2021,2022,2023], engine: '2.0' },
  { brand: 'Honda', model: 'WR-V', years: [2017,2018,2019,2020,2021,2022,2023,2024], engine: '1.5' },
  // Hyundai
  { brand: 'Hyundai', model: 'HB20', years: [2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024], engine: '1.0 Turbo' },
  { brand: 'Hyundai', model: 'HB20S', years: [2013,2014,2015,2016,2017,2018,2019,2020,2021,2022], engine: '1.6' },
  { brand: 'Hyundai', model: 'Creta', years: [2016,2017,2018,2019,2020,2021,2022,2023,2024], engine: '2.0' },
  { brand: 'Hyundai', model: 'Tucson', years: [2007,2010,2012,2016,2017,2018,2019,2020,2021,2022,2023], engine: '2.0' },
  { brand: 'Hyundai', model: 'i30', years: [2009,2010,2011,2012,2013,2014,2015,2016,2017,2018], engine: '2.0' },
  { brand: 'Hyundai', model: 'ix35', years: [2011,2012,2013,2014,2015,2016,2017,2018], engine: '2.0' },
  // Renault
  { brand: 'Renault', model: 'Clio', years: [2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016], engine: '1.0' },
  { brand: 'Renault', model: 'Logan', years: [2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017], engine: '1.6' },
  { brand: 'Renault', model: 'Sandero', years: [2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020], engine: '1.6' },
  { brand: 'Renault', model: 'Duster', years: [2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023], engine: '1.6' },
  { brand: 'Renault', model: 'Kwid', years: [2017,2018,2019,2020,2021,2022,2023,2024], engine: '1.0' },
  { brand: 'Renault', model: 'Captur', years: [2017,2018,2019,2020,2021,2022,2023], engine: '2.0' },
  { brand: 'Renault', model: 'Oroch', years: [2015,2016,2017,2018,2019,2020,2021,2022,2023], engine: '2.0' },
  // Nissan
  { brand: 'Nissan', model: 'March', years: [2011,2012,2013,2014,2015,2016,2017,2018,2019,2020], engine: '1.6' },
  { brand: 'Nissan', model: 'Versa', years: [2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023], engine: '1.6' },
  { brand: 'Nissan', model: 'Kicks', years: [2017,2018,2019,2020,2021,2022,2023,2024], engine: '1.6' },
  { brand: 'Nissan', model: 'Frontier', years: [2003,2008,2010,2013,2017,2018,2019,2020,2021,2022,2023], engine: '2.5 Diesel' },
  { brand: 'Nissan', model: 'Sentra', years: [2007,2010,2014,2020,2021,2022,2023], engine: '2.0' },
  // Jeep
  { brand: 'Jeep', model: 'Renegade', years: [2015,2016,2017,2018,2019,2020,2021,2022,2023,2024], engine: '1.8' },
  { brand: 'Jeep', model: 'Compass', years: [2017,2018,2019,2020,2021,2022,2023,2024], engine: '2.0 Diesel' },
  { brand: 'Jeep', model: 'Commander', years: [2021,2022,2023,2024], engine: '2.0 Turbo' },
  { brand: 'Jeep', model: 'Wrangler', years: [2010,2015,2018,2019,2020,2021,2022,2023], engine: '3.6' },
  // Kia
  { brand: 'Kia', model: 'Sportage', years: [2010,2011,2012,2013,2014,2015,2016,2017,2022,2023,2024], engine: '2.0' },
  { brand: 'Kia', model: 'Cerato', years: [2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020], engine: '1.6' },
  { brand: 'Kia', model: 'Sorento', years: [2012,2015,2016,2017,2018,2019,2020,2021,2022,2023], engine: '2.5' },
  // Mitsubishi
  { brand: 'Mitsubishi', model: 'L200 Triton', years: [2007,2008,2009,2010,2012,2015,2017,2019,2020,2021,2022,2023], engine: '2.4 Diesel' },
  { brand: 'Mitsubishi', model: 'Outlander', years: [2009,2013,2015,2017,2018,2019,2020,2021], engine: '2.0' },
  { brand: 'Mitsubishi', model: 'ASX', years: [2012,2013,2014,2015,2016,2017,2018,2019,2020,2021], engine: '2.0' },
  { brand: 'Mitsubishi', model: 'Eclipse Cross', years: [2021,2022,2023,2024], engine: '1.5 Turbo' },
  { brand: 'Mitsubishi', model: 'Pajero TR4', years: [2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015], engine: '2.0' },
  // Peugeot/Citroën
  { brand: 'Peugeot', model: '206', years: [2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010], engine: '1.4' },
  { brand: 'Peugeot', model: '207', years: [2008,2009,2010,2011,2012,2013,2014,2015], engine: '1.4' },
  { brand: 'Peugeot', model: '208', years: [2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023], engine: '1.6' },
  { brand: 'Peugeot', model: '2008', years: [2017,2018,2019,2020,2021,2022,2023], engine: '1.6' },
  { brand: 'Citroën', model: 'C3', years: [2003,2006,2009,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022], engine: '1.5' },
  { brand: 'Citroën', model: 'C4 Cactus', years: [2015,2016,2017,2018,2019,2020,2021,2022,2023], engine: '1.6' },
  { brand: 'Citroën', model: 'C4 Lounge', years: [2014,2015,2016,2017,2018,2019,2020,2021], engine: '2.0' },
  // BMW/Mercedes/Audi
  { brand: 'BMW', model: 'Série 3', years: [2006,2012,2015,2017,2019,2020,2021,2022,2023], engine: '2.0 Turbo' },
  { brand: 'BMW', model: 'X1', years: [2013,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024], engine: '2.0 Turbo' },
  { brand: 'BMW', model: 'X3', years: [2004,2011,2014,2018,2019,2020,2021,2022,2023], engine: '2.0 Turbo' },
  { brand: 'Mercedes-Benz', model: 'A-Class', years: [2014,2015,2016,2017,2018,2019,2020,2021,2022,2023], engine: '1.6 Turbo' },
  { brand: 'Mercedes-Benz', model: 'C-Class', years: [2008,2011,2015,2016,2017,2018,2019,2020,2021,2022,2023], engine: '2.0 Turbo' },
  { brand: 'Mercedes-Benz', model: 'GLA', years: [2015,2016,2017,2018,2019,2020,2021,2022,2023], engine: '2.0 Turbo' },
  { brand: 'Audi', model: 'A3', years: [2007,2012,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023], engine: '1.4 TFSI' },
  { brand: 'Audi', model: 'Q3', years: [2015,2016,2017,2018,2019,2020,2021,2022,2023,2024], engine: '1.4 TFSI' },
];

// ─── PEÇAS ────────────────────────────────────────────────────────────────────
const PRODUCTS = [
  // Filtros
  { name: 'Filtro de Óleo', brand: 'Fram', category: 'Filtros', internalCode: 'FIL-001', price: 28.90, cost: 15.00, unit: 'un' },
  { name: 'Filtro de Ar Motor', brand: 'Fram', category: 'Filtros', internalCode: 'FIL-002', price: 42.50, cost: 22.00, unit: 'un' },
  { name: 'Filtro de Combustível (Gasolina)', brand: 'Bosch', category: 'Filtros', internalCode: 'FIL-003', price: 38.90, cost: 19.00, unit: 'un' },
  { name: 'Filtro de Combustível (Flex)', brand: 'Bosch', category: 'Filtros', internalCode: 'FIL-004', price: 45.00, cost: 23.00, unit: 'un' },
  { name: 'Filtro de Ar Condicionado (Cabine)', brand: 'Mann', category: 'Filtros', internalCode: 'FIL-005', price: 65.00, cost: 32.00, unit: 'un' },
  { name: 'Filtro de Óleo Diesel', brand: 'WIX', category: 'Filtros', internalCode: 'FIL-006', price: 52.00, cost: 27.00, unit: 'un' },
  // Freios
  { name: 'Pastilha de Freio Dianteira', brand: 'Ferodo', category: 'Freios', internalCode: 'FRE-001', price: 89.90, cost: 45.00, unit: 'jg' },
  { name: 'Pastilha de Freio Traseira', brand: 'Ferodo', category: 'Freios', internalCode: 'FRE-002', price: 79.90, cost: 40.00, unit: 'jg' },
  { name: 'Disco de Freio Dianteiro', brand: 'Brembo', category: 'Freios', internalCode: 'FRE-003', price: 145.00, cost: 75.00, unit: 'un' },
  { name: 'Disco de Freio Traseiro', brand: 'Brembo', category: 'Freios', internalCode: 'FRE-004', price: 125.00, cost: 65.00, unit: 'un' },
  { name: 'Tambor de Freio Traseiro', brand: 'Fremax', category: 'Freios', internalCode: 'FRE-005', price: 110.00, cost: 55.00, unit: 'un' },
  { name: 'Fluido de Freio DOT 4', brand: 'Bosch', category: 'Freios', internalCode: 'FRE-006', price: 28.00, cost: 14.00, unit: 'lt' },
  { name: 'Cilindro de Roda', brand: 'LPR', category: 'Freios', internalCode: 'FRE-007', price: 55.00, cost: 27.00, unit: 'un' },
  { name: 'Curvatura de Freio', brand: 'ATE', category: 'Freios', internalCode: 'FRE-008', price: 38.00, cost: 18.00, unit: 'jg' },
  // Correias
  { name: 'Kit Correia Dentada', brand: 'Gates', category: 'Correias', internalCode: 'COR-001', price: 185.00, cost: 95.00, unit: 'kt' },
  { name: 'Correia Dentada Simples', brand: 'Gates', category: 'Correias', internalCode: 'COR-002', price: 65.00, cost: 33.00, unit: 'un' },
  { name: 'Correia Alternador/Acessórios', brand: 'Gates', category: 'Correias', internalCode: 'COR-003', price: 48.00, cost: 24.00, unit: 'un' },
  { name: 'Correia Poly-V', brand: 'Dayco', category: 'Correias', internalCode: 'COR-004', price: 55.00, cost: 28.00, unit: 'un' },
  { name: 'Tensionador de Correia', brand: 'INA', category: 'Correias', internalCode: 'COR-005', price: 120.00, cost: 62.00, unit: 'un' },
  { name: 'Bomba D\'água + Kit Correia', brand: 'Gates', category: 'Correias', internalCode: 'COR-006', price: 280.00, cost: 145.00, unit: 'kt' },
  // Ignição
  { name: 'Vela de Ignição Standard', brand: 'NGK', category: 'Ignição', internalCode: 'IGN-001', price: 22.00, cost: 11.00, unit: 'un' },
  { name: 'Vela de Ignição Iridium', brand: 'NGK', category: 'Ignição', internalCode: 'IGN-002', price: 68.00, cost: 35.00, unit: 'un' },
  { name: 'Vela de Ignição Platina', brand: 'Bosch', category: 'Ignição', internalCode: 'IGN-003', price: 45.00, cost: 23.00, unit: 'un' },
  { name: 'Bobina de Ignição', brand: 'Bosch', category: 'Ignição', internalCode: 'IGN-004', price: 165.00, cost: 85.00, unit: 'un' },
  { name: 'Cabo de Vela Jogo', brand: 'NGK', category: 'Ignição', internalCode: 'IGN-005', price: 95.00, cost: 48.00, unit: 'jg' },
  { name: 'Sensor Posição Virabrequim', brand: 'Delphi', category: 'Ignição', internalCode: 'IGN-006', price: 135.00, cost: 68.00, unit: 'un' },
  // Óleos e Lubrificantes
  { name: 'Óleo Motor 5W30 Sintético 1L', brand: 'Mobil 1', category: 'Óleos', internalCode: 'OLE-001', price: 58.00, cost: 30.00, unit: 'lt' },
  { name: 'Óleo Motor 5W40 Sintético 1L', brand: 'Castrol', category: 'Óleos', internalCode: 'OLE-002', price: 62.00, cost: 32.00, unit: 'lt' },
  { name: 'Óleo Motor 10W40 Semissintético 1L', brand: 'Valvoline', category: 'Óleos', internalCode: 'OLE-003', price: 35.00, cost: 18.00, unit: 'lt' },
  { name: 'Óleo de Câmbio ATF', brand: 'Texaco', category: 'Óleos', internalCode: 'OLE-004', price: 45.00, cost: 23.00, unit: 'lt' },
  { name: 'Óleo de Direção Hidráulica', brand: 'Bosch', category: 'Óleos', internalCode: 'OLE-005', price: 32.00, cost: 16.00, unit: 'lt' },
  { name: 'Graxa Lubrificante Universal 500g', brand: 'Quimatic', category: 'Óleos', internalCode: 'OLE-006', price: 28.00, cost: 14.00, unit: 'un' },
  // Suspensão
  { name: 'Amortecedor Dianteiro', brand: 'Monroe', category: 'Suspensão', internalCode: 'SUS-001', price: 245.00, cost: 125.00, unit: 'un' },
  { name: 'Amortecedor Traseiro', brand: 'Monroe', category: 'Suspensão', internalCode: 'SUS-002', price: 185.00, cost: 95.00, unit: 'un' },
  { name: 'Kit Amortecedor Dianteiro (Par)', brand: 'Monroe', category: 'Suspensão', internalCode: 'SUS-003', price: 480.00, cost: 245.00, unit: 'kt' },
  { name: 'Pivô Dianteiro', brand: 'Cofap', category: 'Suspensão', internalCode: 'SUS-004', price: 68.00, cost: 34.00, unit: 'un' },
  { name: 'Bandeja Dianteira', brand: 'Nakata', category: 'Suspensão', internalCode: 'SUS-005', price: 195.00, cost: 98.00, unit: 'un' },
  { name: 'Barra Estabilizadora Bucha', brand: 'Nakata', category: 'Suspensão', internalCode: 'SUS-006', price: 35.00, cost: 17.00, unit: 'un' },
  { name: 'Terminal de Direção', brand: 'Delphi', category: 'Suspensão', internalCode: 'SUS-007', price: 85.00, cost: 43.00, unit: 'un' },
  { name: 'Rolamento de Roda Dianteira', brand: 'SKF', category: 'Suspensão', internalCode: 'SUS-008', price: 125.00, cost: 63.00, unit: 'un' },
  { name: 'Kit Bieleta Estabilizadora', brand: 'Nakata', category: 'Suspensão', internalCode: 'SUS-009', price: 45.00, cost: 22.00, unit: 'kt' },
  // Elétrico
  { name: 'Bateria 60Ah', brand: 'Heliar', category: 'Elétrico', internalCode: 'ELE-001', price: 385.00, cost: 195.00, unit: 'un' },
  { name: 'Bateria 45Ah', brand: 'Moura', category: 'Elétrico', internalCode: 'ELE-002', price: 295.00, cost: 150.00, unit: 'un' },
  { name: 'Alternador Recondicionado', brand: 'TRW', category: 'Elétrico', internalCode: 'ELE-003', price: 380.00, cost: 195.00, unit: 'un' },
  { name: 'Motor de Partida Recondicionado', brand: 'TRW', category: 'Elétrico', internalCode: 'ELE-004', price: 320.00, cost: 162.00, unit: 'un' },
  { name: 'Lâmpada Farol H4 55/60W', brand: 'Osram', category: 'Elétrico', internalCode: 'ELE-005', price: 28.00, cost: 14.00, unit: 'un' },
  { name: 'Lâmpada Farol H7 55W', brand: 'Philips', category: 'Elétrico', internalCode: 'ELE-006', price: 32.00, cost: 16.00, unit: 'un' },
  { name: 'Sensor de Temperatura do Motor', brand: 'Bosch', category: 'Elétrico', internalCode: 'ELE-007', price: 75.00, cost: 38.00, unit: 'un' },
  { name: 'Relé de Injeção', brand: 'Bosch', category: 'Elétrico', internalCode: 'ELE-008', price: 38.00, cost: 19.00, unit: 'un' },
  // Arrefecimento
  { name: 'Aditivo de Radiador Concentrado 1L', brand: 'Wurth', category: 'Arrefecimento', internalCode: 'ARR-001', price: 35.00, cost: 17.00, unit: 'lt' },
  { name: 'Termostato', brand: 'Gates', category: 'Arrefecimento', internalCode: 'ARR-002', price: 65.00, cost: 33.00, unit: 'un' },
  { name: 'Bomba D\'água', brand: 'Continental', category: 'Arrefecimento', internalCode: 'ARR-003', price: 185.00, cost: 95.00, unit: 'un' },
  { name: 'Mangueira Superior do Radiador', brand: 'Gates', category: 'Arrefecimento', internalCode: 'ARR-004', price: 55.00, cost: 28.00, unit: 'un' },
  { name: 'Mangueira Inferior do Radiador', brand: 'Gates', category: 'Arrefecimento', internalCode: 'ARR-005', price: 48.00, cost: 24.00, unit: 'un' },
  { name: 'Tampa do Radiador', brand: 'Wahler', category: 'Arrefecimento', internalCode: 'ARR-006', price: 28.00, cost: 14.00, unit: 'un' },
  { name: 'Radiador (Universal Compacto)', brand: 'Valeo', category: 'Arrefecimento', internalCode: 'ARR-007', price: 580.00, cost: 295.00, unit: 'un' },
  // Palhetas e limpador
  { name: 'Palheta Limpador Dianteira 18"', brand: 'Bosch', category: 'Palhetas', internalCode: 'PAL-001', price: 38.00, cost: 19.00, unit: 'un' },
  { name: 'Palheta Limpador Dianteira 24"', brand: 'Bosch', category: 'Palhetas', internalCode: 'PAL-002', price: 42.00, cost: 21.00, unit: 'un' },
  { name: 'Palheta Limpador Traseira 12"', brand: 'Bosch', category: 'Palhetas', internalCode: 'PAL-003', price: 35.00, cost: 17.00, unit: 'un' },
  { name: 'Kit Palhetas Dianteiras (Par)', brand: 'Trico', category: 'Palhetas', internalCode: 'PAL-004', price: 75.00, cost: 38.00, unit: 'kt' },
  // Injeção
  { name: 'Bico Injetor', brand: 'Bosch', category: 'Injeção', internalCode: 'INJ-001', price: 185.00, cost: 95.00, unit: 'un' },
  { name: 'Corpo de Borboleta (TBI)', brand: 'Delphi', category: 'Injeção', internalCode: 'INJ-002', price: 285.00, cost: 145.00, unit: 'un' },
  { name: 'Sensor de Oxigênio (Sonda Lambda)', brand: 'Bosch', category: 'Injeção', internalCode: 'INJ-003', price: 165.00, cost: 83.00, unit: 'un' },
  { name: 'Sensor MAP', brand: 'Delphi', category: 'Injeção', internalCode: 'INJ-004', price: 95.00, cost: 48.00, unit: 'un' },
  { name: 'Válvula EGR', brand: 'Gates', category: 'Injeção', internalCode: 'INJ-005', price: 320.00, cost: 162.00, unit: 'un' },
  // Transmissão
  { name: 'Kit Embreagem Completo', brand: 'LuK', category: 'Transmissão', internalCode: 'TRA-001', price: 680.00, cost: 345.00, unit: 'kt' },
  { name: 'Platô de Embreagem', brand: 'LuK', category: 'Transmissão', internalCode: 'TRA-002', price: 285.00, cost: 145.00, unit: 'un' },
  { name: 'Disco de Embreagem', brand: 'LuK', category: 'Transmissão', internalCode: 'TRA-003', price: 195.00, cost: 98.00, unit: 'un' },
  { name: 'Rolamento Atuador (Cutuca)', brand: 'SKF', category: 'Transmissão', internalCode: 'TRA-004', price: 95.00, cost: 48.00, unit: 'un' },
  { name: 'Junta Homocinética Interna', brand: 'GSP', category: 'Transmissão', internalCode: 'TRA-005', price: 145.00, cost: 73.00, unit: 'un' },
  { name: 'Semi-eixo (Lado Direito)', brand: 'Meyle', category: 'Transmissão', internalCode: 'TRA-006', price: 380.00, cost: 195.00, unit: 'un' },
  // Acessórios
  { name: 'Produto de Limpeza de Injetores', brand: 'Wurth', category: 'Acessórios', internalCode: 'ACS-001', price: 35.00, cost: 17.00, unit: 'un' },
  { name: 'Silicone Vermelho Alta Temperatura', brand: 'Permatex', category: 'Acessórios', internalCode: 'ACS-002', price: 28.00, cost: 14.00, unit: 'un' },
  { name: 'Spray Limpa Contato', brand: 'Quimatic', category: 'Acessórios', internalCode: 'ACS-003', price: 22.00, cost: 11.00, unit: 'un' },
  { name: 'WD-40 350ml', brand: 'WD-40', category: 'Acessórios', internalCode: 'ACS-004', price: 38.00, cost: 19.00, unit: 'un' },
  { name: 'Fita Isolante Profissional', brand: '3M', category: 'Acessórios', internalCode: 'ACS-005', price: 12.00, cost: 6.00, unit: 'un' },
];

async function main() {
  console.log('Iniciando seed...');

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: {},
    create: { name: 'Auto Peças Demo', slug: 'demo', plan: 'pro' },
  });

  const hash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email_tenantId: { email: 'admin@demo.com', tenantId: tenant.id } },
    update: {},
    create: { email: 'admin@demo.com', passwordHash: hash, name: 'Administrador', role: 'admin', tenantId: tenant.id },
  });

  // Produtos
  console.log(`Criando ${PRODUCTS.length} produtos...`);
  const productMap: Record<string, string> = {};
  for (const p of PRODUCTS) {
    const existing = await prisma.product.findFirst({ where: { internalCode: p.internalCode, tenantId: tenant.id } });
    let product;
    if (existing) {
      product = existing;
    } else {
      product = await prisma.product.create({
        data: {
          ...p,
          tenantId: tenant.id,
          stock: { create: { quantity: Math.floor(Math.random() * 20) + 2, minQuantity: 3, tenantId: tenant.id } },
        },
      });
    }
    productMap[p.internalCode] = product.id;
  }

  // Veículos (expandir anos em entradas individuais)
  console.log('Criando veículos...');
  let vehicleCount = 0;
  for (const v of VEHICLES) {
    for (const year of v.years) {
      const exists = await prisma.vehicle.findFirst({
        where: { brand: v.brand, model: v.model, year, engine: v.engine, tenantId: tenant.id },
      });
      if (!exists) {
        await prisma.vehicle.create({ data: { brand: v.brand, model: v.model, year, engine: v.engine, tenantId: tenant.id } });
        vehicleCount++;
      }
    }
  }

  // Clientes de exemplo
  const customerNames = [
    ['Carlos Silva', '123.456.789-00', '(11) 99999-1234'],
    ['Ana Lima', '987.654.321-00', '(21) 98888-5678'],
    ['João Pereira', '456.789.123-00', '(31) 97777-9012'],
    ['Fernanda Souza', '321.654.987-00', '(41) 96666-3456'],
    ['Roberto Oliveira', '654.321.987-00', '(51) 95555-7890'],
  ];

  for (const [name, document, phone] of customerNames) {
    const exists = await prisma.customer.findFirst({ where: { document, tenantId: tenant.id } });
    if (!exists) await prisma.customer.create({ data: { name, document, phone, tenantId: tenant.id } });
  }

  console.log(`✔ Seed concluído:`);
  console.log(`  - ${PRODUCTS.length} produtos criados`);
  console.log(`  - ${vehicleCount} veículos criados (2000-2024)`);
  console.log(`  - 5 clientes de exemplo`);
  console.log(`  Login: admin@demo.com / admin123`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
